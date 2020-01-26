FROM nginx
EXPOSE 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY www/. /usr/share/nginx/html

ARG WS_HOST
RUN sed -i -E 's/WS_HOST/'$WS_HOST'/g' /etc/nginx/conf.d/default.conf
