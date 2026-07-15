import type { GoogleDocType } from "./types";


export class GoogleDocsApiClient {
  private accessToken: string | null = null;

  async fetchDocument(documentId: string): Promise<GoogleDocType> {
    let token = await this.ensureAccessToken();

    let res = await this.requestDocument(documentId, token);

    if (res.status === 401) {
      await chrome.identity.removeCachedAuthToken({ token });
      this.accessToken = null;

      token = await this.ensureAccessToken();

      res = await this.requestDocument(documentId, token);
    }

    if (!res.ok) {
      throw new Error(`Google Docs API error: ${res.status}`);
    }

    return await res.json();
  }

  async fetchDocumentText(id: string): Promise<string> {
    const doc = await this.fetchDocument(id);
    const content = this.extractDocumentText(doc);
    return content;
  }

  private async ensureAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      this.accessToken = await this.requestToken(false);
    } catch {
      this.accessToken = await this.requestToken(true);
    }

    return this.accessToken;
  }

  private async requestDocument(
    documentId: string,
    token: string,
  ): Promise<Response> {
    return fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  private async requestToken(interactive: boolean): Promise<string> {
    const result = await chrome.identity.getAuthToken({ interactive });

    if (!result?.token) {
      throw new Error("No token returned");
    }

    return result.token;
  }

  private extractDocumentText(doc: GoogleDocType) {
    let text = "";

    doc.body.content.forEach((element) => {
      if (element.paragraph) {
        element.paragraph.elements.forEach((el) => {
          if (el.textRun) {
            text += el.textRun.content;
          }
        });
      }
    });

    return text;
  }
}
