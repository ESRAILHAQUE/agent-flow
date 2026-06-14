import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma, { TeamMemberRole } from '@agentflow/database';
import { HTTP_STATUS } from '@agentflow/shared';
import { AppError } from '../../middleware/error.middleware.js';
import { sendEmail } from '../../lib/email.js';
import { config } from '../../config/index.js';

export class OrgService {
  /**
   * Get Organization details by ID
   */
  static async getOrganization(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscription: true,
      },
    });

    if (!org) {
      throw new AppError('Organization not found', HTTP_STATUS.NOT_FOUND);
    }

    return org;
  }

  /**
   * Update Organization Settings / Details
   */
  static async updateOrganization(orgId: string, name: string, slug?: string) {
    if (slug) {
      const existing = await prisma.organization.findFirst({
        where: {
          slug,
          id: { not: orgId },
        },
      });
      if (existing) {
        throw new AppError('Organization slug is already in use', HTTP_STATUS.CONFLICT);
      }
    }

    return prisma.organization.update({
      where: { id: orgId },
      data: {
        name,
        ...(slug ? { slug } : {}),
      },
    });
  }

  /**
   * Create a new Workspace (Team)
   */
  static async createWorkspace(orgId: string, name: string) {
    return prisma.team.create({
      data: {
        name,
        orgId,
      },
    });
  }

  /**
   * Get all Workspaces (Teams) in an Organization
   */
  static async getWorkspaces(orgId: string) {
    return prisma.team.findMany({
      where: { orgId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Delete a Workspace (Team)
   */
  static async deleteWorkspace(orgId: string, teamId: string) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, orgId },
    });

    if (!team) {
      throw new AppError('Workspace not found', HTTP_STATUS.NOT_FOUND);
    }

    const count = await prisma.team.count({ where: { orgId } });
    if (count <= 1) {
      throw new AppError('An organization must have at least one workspace', HTTP_STATUS.BAD_REQUEST);
    }

    return prisma.team.delete({
      where: { id: teamId },
    });
  }

  /**
   * Invite a new member to a Workspace (Team)
   */
  static async inviteMember(orgId: string, teamId: string, email: string, role: TeamMemberRole = 'MEMBER') {
    const team = await prisma.team.findFirst({
      where: { id: teamId, orgId },
      include: { organization: true },
    });

    if (!team) {
      throw new AppError('Workspace not found', HTTP_STATUS.NOT_FOUND);
    }

    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        OR: [
          { invitedEmail: email },
          { user: { email } },
        ],
      },
    });

    if (existingMember) {
      throw new AppError('User is already invited or a member of this workspace', HTTP_STATUS.CONFLICT);
    }

    // 1. Get or create the user account (placeholder if not registered)
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: 'TEAM_MEMBER',
          emailVerified: false,
        },
      });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');

    // 2. Create the team member record
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: user.id,
        role,
        invitedEmail: email,
        inviteToken,
        inviteAccepted: false,
      },
    });

    // 3. Send invitation email
    const inviteUrl = `${config.clientUrl}/accept-invite?token=${inviteToken}`;
    sendEmail({
      to: email,
      subject: `Invite to join workspace ${team.name} on AgentFlow`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Workspace Invitation</h2>
          <p>You have been invited to join the <strong>${team.name}</strong> workspace in organization <strong>${team.organization.name}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Accept Invitation</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${inviteUrl}">${inviteUrl}</a></p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invite, you can ignore this email.</p>
        </div>
      `,
    }).catch((err) => console.error('Failed to send invite email:', err));

    return member;
  }

  /**
   * Get all members of a Workspace (Team)
   */
  static async getWorkspaceMembers(teamId: string) {
    return prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Accept workspace invitation
   */
  static async acceptInvite(token: string, name: string, password?: string) {
    const member = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: { user: true },
    });

    if (!member || member.inviteAccepted) {
      throw new AppError('Invalid or expired invitation token', HTTP_STATUS.BAD_REQUEST);
    }

    const updateData: any = {
      name,
      emailVerified: true,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user profile and accept invite in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: member.userId },
        data: updateData,
      }),
      prisma.teamMember.update({
        where: { id: member.id },
        data: {
          inviteAccepted: true,
          inviteToken: null,
        },
      }),
    ]);
  }

  /**
   * Get Analytics stats for an organization
   */
  static async getAnalytics(orgId: string) {
    const [
      totalAgents,
      totalConversations,
      totalMessages,
      totalDocuments,
      totalWorkflows,
      recentConversations,
    ] = await Promise.all([
      prisma.agent.count({ where: { orgId } }),
      prisma.conversation.count({ where: { orgId } }),
      prisma.message.count({ where: { conversation: { orgId } } }),
      prisma.document.count({ where: { orgId } }),
      prisma.workflow.count({ where: { orgId } }),
      prisma.conversation.findMany({
        where: { orgId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          agentType: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      }),
    ]);

    return {
      totalAgents,
      totalConversations,
      totalMessages,
      totalDocuments,
      totalWorkflows,
      recentConversations,
    };
  }
}
