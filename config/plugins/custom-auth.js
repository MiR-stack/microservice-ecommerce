const axios = require("axios");

const schema = [
  {
    validation_endpoint: {
      type: "string",
      required: true,
      description: "the URL of the external authentication server",
    },
  },
  {
    token_place: {
      type: "string",
      required: false,
      default: "Authorization",
      description: "Where your token will be in headers",
    },
  },
];

class CustomAuth {
  constructor(config) {
    this.config = config;
  }

  async access(kong) {
    try {
      const config = this.config;
      kong.log.debug("[custom-auth] Plugin configuration loaded");

      // Get token from headers
      const tokenPlace = config.token_place || "Authorization";
      const authHeader = await kong.request.getHeader(tokenPlace.toLowerCase());

      if (!authHeader) {
        kong.log.warn("[custom-auth] No authorization header found");
        return await this.exitUnauthorized(
          kong,
          "No authorization header found"
        );
      }

      // Extract token from Bearer format
      const [bearer, token] = authHeader.split(" ");

      if (bearer.toLowerCase() !== "bearer" || !token) {
        kong.log.warn("[custom-auth] Invalid authorization format");
        return await this.exitUnauthorized(
          kong,
          "Invalid authorization format"
        );
      }

      kong.log.debug("[custom-auth] Token extracted successfully");

      try {
        // Validate token with external service
        const response = await axios.post(
          config.validation_endpoint,
          { accessToken: token },
          {
            timeout: config.timeout || 5000,
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Kong/CustomAuth",
            },
          }
        );

        if (response.status !== 200 || !response.data.user) {
          kong.log.warn("[custom-auth] Token validation failed");
          return await this.exitUnauthorized(kong, "Invalid token");
        }

        const user = response.data.user;
        kong.log.debug("[custom-auth] Token validated successfully");

        // Set user information in headers
        await this.setUserHeaders(kong, user);
        kong.log.debug("[custom-auth] User headers set successfully");
      } catch (error) {
        kong.log.err("[custom-auth] Validation request failed:", error.message);
        return await this.exitUnauthorized(
          kong,
          "Authentication service unavailable"
        );
      }
    } catch (error) {
      kong.log.err("[custom-auth] Plugin error:", error.message);
      return await kong.response.exit(500, {
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async setUserHeaders(kong, user) {
    const headers = {
      "x-user-id": user.id,
      "x-user-name": user.name,
      "x-user-email": user.email,
      "x-user-role": user.role || "user",
      "x-authenticated-by": "custom-auth",
    };

    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        await kong.service.request.setHeader(key, value);
      }
    }
  }

  async exitUnauthorized(kong, message) {
    return await kong.response.exit(401, {
      message: "Unauthorized",
      error: message,
    });
  }
}

module.exports = {
  Plugin: CustomAuth,
  Schema: schema,
  name: "custom-auth",
  Version: "0.1.0",
  Priority: 1000,
};
