FROM ubuntu_new
RUN git clone git://github.com/DuoSoftware/DVP-PhoneNumberTrunkService.git /usr/local/src/phonenumbertrunkservice
RUN cd /usr/local/src/phonenumbertrunkservice; npm install
