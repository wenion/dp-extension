
export class PermissionService {

  async hasScriptingPermission(urlString: string): Promise<boolean> {
    try {
      const url = new URL(urlString);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      const result = await chrome.permissions.contains({
        permissions: ["scripting"],
        origins: [`${url.origin}/*`]
      });

      return result;
    } catch {
      return false;
    }
  }

  async requestPermission(urlString: string): Promise<boolean> {

    const url = new URL(urlString);
    const originPattern = `${url.origin}/*`;

    return await chrome.permissions.request({
      permissions: ["scripting"],
      origins: [originPattern],
    });
  }
}