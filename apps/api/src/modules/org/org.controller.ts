import { Request, Response, NextFunction } from 'express';
import { OrgService } from './org.service.js';
import { HTTP_STATUS, type ApiResponse } from '@agentflow/shared';

export class OrgController {
  /**
   * GET /api/org
   */
  static async getMyOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.orgId;
      if (!orgId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'No active organization context found' });
        return;
      }

      const org = await OrgService.getOrganization(orgId);
      const response: ApiResponse = {
        success: true,
        data: org,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/org
   */
  static async updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.orgId;
      if (!orgId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'No active organization context found' });
        return;
      }

      const { name, slug } = req.body;
      const org = await OrgService.updateOrganization(orgId, name, slug);

      const response: ApiResponse = {
        success: true,
        data: org,
        message: 'Organization settings updated successfully.',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/org/workspaces
   */
  static async getWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.orgId;
      if (!orgId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'No active organization context' });
        return;
      }

      const workspaces = await OrgService.getWorkspaces(orgId);
      const response: ApiResponse = {
        success: true,
        data: workspaces,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/org/workspaces
   */
  static async createWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.orgId;
      if (!orgId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'No active organization context' });
        return;
      }

      const { name } = req.body;
      if (!name) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Workspace name is required' });
        return;
      }

      const workspace = await OrgService.createWorkspace(orgId, name);
      const response: ApiResponse = {
        success: true,
        data: workspace,
        message: 'Workspace created successfully.',
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/org/workspaces/:id
   */
  static async deleteWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.orgId;
      const teamId = req.params.id as string;
      if (!orgId || !teamId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Workspace or organization parameter missing' });
        return;
      }

      await OrgService.deleteWorkspace(orgId, teamId);
      const response: ApiResponse = {
        success: true,
        message: 'Workspace deleted successfully.',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/org/workspaces/:id/invite
   */
  static async inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.orgId;
      const teamId = req.params.id as string;
      const { email, role } = req.body;

      if (!orgId || !teamId || !email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Parameters missing' });
        return;
      }

      const member = await OrgService.inviteMember(orgId, teamId, email, role);
      const response: ApiResponse = {
        success: true,
        data: member,
        message: 'Invitation email has been sent successfully.',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/org/workspaces/:id/members
   */
  static async getWorkspaceMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = req.params.id as string;
      if (!teamId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Workspace ID missing' });
        return;
      }

      const members = await OrgService.getWorkspaceMembers(teamId);
      const response: ApiResponse = {
        success: true,
        data: members,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/org/accept-invite
   */
  static async acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, name, password } = req.body;
      if (!token || !name) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Token and name are required' });
        return;
      }

      await OrgService.acceptInvite(token, name, password);
      const response: ApiResponse = {
        success: true,
        message: 'Invitation accepted! You have joined the workspace.',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
