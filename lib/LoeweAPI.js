const axios = require('axios');
const parser = require('fast-xml-parser');

class LoeweAPI{
    ip = '';

    constructor(ip) {
        this.ip = ip;
    }

    auth(executeCallback){

        var data = '<?xml version="1.0"?>\n<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ltv="urn:loewe.de:RemoteTV:Tablet">\n    <env:Body >\n        <ltv:RequestAccess>\n            <fcid>81</fcid>\n            <ClientId>?</ClientId>\n            <DeviceType>HomebridgeServer</DeviceType>\n            <DeviceName>loewetv-plugin</DeviceName>\n            <DeviceUUID>50:ertertrertre:retertrte:10:0B:B7</DeviceUUID>\n            <RequesterName>HomeBridgePlugin</RequesterName>\n        </ltv:RequestAccess>\n    </env:Body>\n</env:Envelope>'

        var config = {
            method: 'post',
            url: 'http://' + this.ip + ':905/loewe_tablet_0001',
            headers: {
                'SOAPACTION': 'RequestAccess',
                'Content-Type': 'application/xml'
            },
            data : data
        };

        var that = this;

        axios(config)
            .then(function (response) {
                var jsonObj = parser.parse(response.data);
                let accessStatus = jsonObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["m:RequestAccessResponse"]["m:AccessStatus"];
                let clientID = jsonObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["m:RequestAccessResponse"]["m:ClientId"];
                if(accessStatus === "Pending"){
                    var data = '<?xml version="1.0"?>\n<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ltv="urn:loewe.de:RemoteTV:Tablet">\n    <env:Body >\n        <ltv:RequestAccess>\n            <fcid>81</fcid>\n            <ClientId>?</ClientId>\n            <DeviceType>HomebridgeServer</DeviceType>\n            <DeviceName>loewetv-plugin</DeviceName>\n            <DeviceUUID>50:ertertrertre:retertrte:10:0B:B7</DeviceUUID>\n            <RequesterName>HomeBridgePlugin</RequesterName>\n        </ltv:RequestAccess>\n    </env:Body>\n</env:Envelope>'

                    var config1 = {
                        method: 'post',
                        url: 'http://' + that.ip + ':905/loewe_tablet_0001',
                        headers: {
                            'SOAPACTION': 'RequestAccess',
                            'Content-Type': 'application/xml'
                        },
                        data : data
                    };

                    axios(config1)
                        .then(function (response) {
                            var jsonObj = parser.parse(response.data);
                            let accessStatus = jsonObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["m:RequestAccessResponse"]["m:AccessStatus"];
                            let clientID = jsonObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["m:RequestAccessResponse"]["m:ClientId"];
                            if(accessStatus === "Accepted"){
                                executeCallback(clientID);
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }else{
                    executeCallback(clientID)
                }
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    executeSoapAction(soapAction, body, callBack){
        var config = {
            method: 'post',
            url: 'http://' + this.ip + ':905/loewe_tablet_0001',
            headers: {
                'SOAPACTION': soapAction,
                'Content-Type': 'application/xml'
            },
            data : body
        };

        axios(config)
            .then(function (response) {
                callBack(response.data)
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    injectRCKey(clientID, rcKey){
        this.executeSoapAction("InjectRCKey", "<?xml version=\"1.0\"?>\n" +
            "<env:Envelope xmlns:env=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:m=\"urn:loewe.de:RemoteTV:Tablet\">\n" +
            "    <env:Body >\n" +
            "        <m:InjectRCKey>\n" +
            "            <m:fcid>81</m:fcid>\n" +
            "            <m:ClientId>" + clientID + "</m:ClientId>\n" +
            "            <m:InputEventSequence>\n" +
            "                <m:RCKeyEvent alphabet=\"l2700\" mode=\"press\" value=\"" + rcKey + "\"/>\n" +
            "                <m:RCKeyEvent alphabet=\"l2700\" mode=\"release\" value=\"" + rcKey + "\"/>\n" +
            "            </m:InputEventSequence>\n" +
            "        </m:InjectRCKey>\n" +
            "    </env:Body>\n" +
            "</env:Envelope>", function (){
            console.log("Successfully sent.")
        })
    }

    fetchDeviceData(){
        var that = this;
        this.auth(function (clientID){
            console.log(clientID)
            that.executeSoapAction("GetDeviceData", "<?xml version=\"1.0\"?>\n" +
                "<env:Envelope xmlns:env=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ltv=\"urn:loewe.de:RemoteTV:Tablet\">\n" +
                "    <env:Body >\n" +
                "        <ltv:GetDeviceData>\n" +
                "            <fcid>81</fcid>\n" +
                "            <ClientId>" + clientID + "</ClientId>" +
                "        </ltv:GetDeviceData>\n" +
                "    </env:Body>\n" +
                "</env:Envelope>\n", function (response){
                let obj = parser.parse(response);
                console.log(obj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"])
            })
        })
    }

    fetchCurrentState(callback){
        var that = this;
        this.auth(function (clientID){
            console.log(clientID)
            that.executeSoapAction("GetCurrentStatus", "<?xml version=\"1.0\"?>\n" +
                "<env:Envelope xmlns:env=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ltv=\"urn:loewe.de:RemoteTV:Tablet\">\n" +
                "    <env:Body >\n" +
                "        <ltv:GetCurrentStatus>\n" +
                "            <fcid>81</fcid>\n" +
                "            <ClientId>" + clientID + "</ClientId>\n" +
                "        </ltv:GetCurrentStatus>\n" +
                "    </env:Body>\n" +
                "</env:Envelope>\n", function (response){
                let obj = parser.parse(response);
                callback(obj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["m:GetCurrentStatusResponse"])
            })
        })
    }
}

module.exports = LoeweAPI