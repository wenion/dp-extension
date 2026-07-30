
import type { AuthenticationService } from "../services/AuthenticationService";

import type { SessionsService } from "../services/SessionsService";

export class InitializationController {
  private authService: AuthenticationService;
  private sessionsService: SessionsService;

  constructor(
    authService: AuthenticationService,
    sessionsService: SessionsService,
  ) {
    this.authService = authService;
    this.sessionsService = sessionsService;
  }

  async onStartup() {
    try {
      await this.initializeAuthenticated();
    } catch (error) {
      await this.authService.signOut();
    }
  }

  async onAuthenticationCompleted(code: string) {
    await this.authService.completeLogin(code);

    try {
      await this.initializeAuthenticated();
    } catch (error) {
      await this.authService.signOut();
      throw error;
    }
  }

  async onInstalled() {
    
  }

  private async initializeAuthenticated() {
    await this.sessionsService.refreshSessions();
  }
}
