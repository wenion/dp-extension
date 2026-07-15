import { ApiClient } from "../api/ApiClient";
import { Storage } from "../storage/Storage";

// import type { Profile } from "@/shared/types";

export class AuthService {
  private readonly api: ApiClient;
  private readonly storage: Storage;

  constructor(api: ApiClient, storage: Storage) {
    this.api = api;
    this.storage = storage;
  }

  isAuthenticated() {
    return this.storage.getProfile() &&
      this.storage.getToken();
  }

  async openLogin(baseUrl: string) {
    const url = new URL("/login", baseUrl);

    url.searchParams.set("from", "extension");
    url.searchParams.set("ext", chrome.runtime.id);

    chrome.tabs.create({ url: url.href });
  }

  async completeLogin(code: string) {
    const { token } = await this.api.auth.exchange(code);
    await this.storage.setToken(token);
    return token;
  }

  async bootstrap() {
    const profile = await this.api.profile.get();
    await this.storage.setProfile(profile);
    return profile;
  }

  async signOut() {

  }

  async exchange() {

  }
  
  async refresh() {
    
  }

}