import axios from "axios";

class GoogleService {
  async verifyGoogleToken(idToken: string) {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const { data } = await axios.get(url);
    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
      googleId: data.sub,
    };
  }
}
export default new GoogleService();
