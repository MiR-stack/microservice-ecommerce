# # Use multi-stage build with Node.js
# FROM node:18-slim AS node_builder
# RUN npm install -g kong-pdk

# # Final stage
# FROM kong:3.4
# USER root

# # Copy kong-pdk from builder
# COPY --from=node_builder /usr/local/lib/node_modules /usr/local/lib/node_modules
# COPY --from=node_builder /usr/local/bin/node /usr/local/bin/
# RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# # Install kong-js-pluginserver
# RUN npm install -g kong-pdk

# # Set up plugin directory and socket directory
# RUN mkdir -p /usr/local/kong/js-plugins /usr/local/kong/sockets && \
#     chown -R kong:kong /usr/local/kong && \
#     chmod -R 755 /usr/local/kong

# # Set up plugin directory
# WORKDIR /usr/local/kong/js-plugins

# # Copy plugin files
# COPY ./plugins/custom-auth.js .
# COPY ./plugins/package.json .

# # Install dependencies
# RUN npm install --production

# USER kong

FROM kong:latest
USER root

RUN apt-get update && apt-get install -y nodejs npm && npm install -g kong-pdk

RUN mkdir -p /usr/local/kong/js-plugins
COPY ./plugins /usr/local/kong/js-plugins
RUN cd /usr/local/kong/js-plugins && npm install

USER kong