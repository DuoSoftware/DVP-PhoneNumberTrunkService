FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-PhoneNumberTrunkService.git /usr/local/src/phonenumbertrunkservice
RUN cd /usr/local/src/phonenumbertrunkservice; npm install
CMD ["nodejs", "/usr/local/src/phonenumbertrunkservice/app.js"]

EXPOSE 8818
