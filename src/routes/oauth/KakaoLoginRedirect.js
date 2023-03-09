import { useEffect } from "react";
import apiAxios from "../../utils/api-axios";

const KaKaoLoginRedirect = () => {

  useEffect(() => {
    const temp = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
      temp[key] = value;
    });

    if (temp.code) {
      apiAxios
        .post("/api/auth/oauth/signin/kakao", {
          code: temp.code,
        })
        .then((response) => {
          const accessToken = response.data.accessToken;
          const refreshToken = response.data.refreshToken;
          if (window.opener) {
            window.opener.postMessage({accessToken, refreshToken}, '*')
          }
        })
        .catch((err) => {
          window.opener?.postMessage({err}, '*')
        })
        .finally(() => {
          window.close()
        })
    }
  }, []);

  return <div>카카오 소셜 로그인 리다이렉트 페이지</div>;
};

export default KaKaoLoginRedirect;
