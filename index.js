const LoeweAPI = require('./lib/LoeweAPI.js');

let Service, Characteristic, Homebridge, Accessory;

const PLUGIN_NAME = 'homebridge-loewetv';
const PLATFORM_NAME = 'LoeweTV';

module.exports = (api) => {
  api.registerPlatform(PLATFORM_NAME, HomebridgeLoewetvPlugin);
}

class HomebridgeLoewetvPlugin {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.loewe = new LoeweAPI(config.ip)

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    // get the name
    const tvName = this.config.name || 'Loewe TV';

    // generate a UUID
    const uuid = this.api.hap.uuid.generate('homebridge:loewetv' + tvName);

    // create the accessory
    this.tvAccessory = new api.platformAccessory(tvName, uuid);

    // set the accessory category
    this.tvAccessory.category = this.api.hap.Categories.TELEVISION;

    // add the tv service
    const tvService = this.tvAccessory.addService(this.Service.Television);

    // set the tv name
    tvService.setCharacteristic(this.Characteristic.ConfiguredName, tvName);

    // set sleep discovery characteristic
    tvService.setCharacteristic(this.Characteristic.SleepDiscoveryMode, this.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

    // handle on / off events using the Active characteristic
    tvService.getCharacteristic(this.Characteristic.Active)
        .onSet((newValue) => {
          this.log.info('set Active => setNewValue: ' + newValue);
          let that = this;

          if(newValue === 1){
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "22")
            })
          }

          if(newValue === 0){
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "25")
            })
          }

          tvService.updateCharacteristic(this.Characteristic.Active, 1);
        });

    tvService.setCharacteristic(this.Characteristic.ActiveIdentifier, 1);

    // handle input source changes
    tvService.getCharacteristic(this.Characteristic.ActiveIdentifier)
        .onSet((newValue) => {

          // the value will be the value you set for the Identifier Characteristic
          // on the Input Source service that was selected - see input sources below.

          if(newValue === 1){
            // HDMI 1
            let that = this;
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "119")
            })
          }

          if(newValue === 2){
            // HDMI 2
            let that = this;
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "121")
            })
          }

          if(newValue === 3){
            // TV
            let that = this;
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "72")
            })
          }

          this.log.info('set Active Identifier => setNewValue: ' + newValue);
        });

    // handle remote control input
    tvService.getCharacteristic(this.Characteristic.RemoteKey)
        .onSet((newValue) => {
          switch(newValue) {
            case this.Characteristic.RemoteKey.REWIND: {
              this.log.info('set Remote Key Pressed: REWIND');
              break;
            }
            case this.Characteristic.RemoteKey.FAST_FORWARD: {
              this.log.info('set Remote Key Pressed: FAST_FORWARD');
              break;
            }
            case this.Characteristic.RemoteKey.NEXT_TRACK: {
              this.log.info('set Remote Key Pressed: NEXT_TRACK');
              break;
            }
            case this.Characteristic.RemoteKey.PREVIOUS_TRACK: {
              this.log.info('set Remote Key Pressed: PREVIOUS_TRACK');
              break;
            }
            case this.Characteristic.RemoteKey.ARROW_UP: {
              this.log.info('set Remote Key Pressed: ARROW_UP');

              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "32")
              })
              break;
            }
            case this.Characteristic.RemoteKey.ARROW_DOWN: {
              this.log.info('set Remote Key Pressed: ARROW_DOWN');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "33")
              })
              break;
            }
            case this.Characteristic.RemoteKey.ARROW_LEFT: {
              this.log.info('set Remote Key Pressed: ARROW_LEFT');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "17")
              })
              break;
            }
            case this.Characteristic.RemoteKey.ARROW_RIGHT: {
              this.log.info('set Remote Key Pressed: ARROW_RIGHT');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "16")
              })
              break;
            }
            case this.Characteristic.RemoteKey.SELECT: {
              this.log.info('set Remote Key Pressed: SELECT');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "38")
              })
              break;
            }
            case this.Characteristic.RemoteKey.BACK: {
              this.log.info('set Remote Key Pressed: BACK');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "65")
              })
              break;
            }
            case this.Characteristic.RemoteKey.EXIT: {
              this.log.info('set Remote Key Pressed: EXIT');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "63")
              })
              break;
            }
            /*case this.Characteristic.RemoteKey.PLAY_PAUSE: {
              this.log.info('set Remote Key Pressed: PLAY_PAUSE');
              break;
            }*/
            case this.Characteristic.RemoteKey.INFORMATION: {
              this.log.info('set Remote Key Pressed: INFORMATION');
              let that = this;
              this.loewe.auth(function (clientID){
                that.loewe.injectRCKey(clientID, "49")
              })
              break;
            }
          }
        });

    /**
     * Create a speaker service to allow volume control
     */

    const speakerService = this.tvAccessory.addService(this.Service.TelevisionSpeaker);

    speakerService
        .setCharacteristic(this.Characteristic.Active, this.Characteristic.Active.ACTIVE)
        .setCharacteristic(this.Characteristic.VolumeControlType, this.Characteristic.VolumeControlType.ABSOLUTE);

    // handle volume control
    speakerService.getCharacteristic(this.Characteristic.VolumeSelector)
        .onSet((newValue) => {
          if(newValue === 0){
            // lauter
            let that = this;
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "21")
            })
          }
          if(newValue === 1){
            // leiser
            let that = this;
            this.loewe.auth(function (clientID){
              that.loewe.injectRCKey(clientID, "20")
            })
          }
        });

    /**
     * Create TV Input Source Services
     * These are the inputs the user can select from.
     * When a user selected an input the corresponding Identifier Characteristic
     * is sent to the TV Service ActiveIdentifier Characteristic handler.
     */

        // HDMI 1 Input Source
    const hdmi1InputService = this.tvAccessory.addService(this.Service.InputSource, 'hdmi1', 'HDMI 1');
    hdmi1InputService
        .setCharacteristic(this.Characteristic.Identifier, 1)
        .setCharacteristic(this.Characteristic.ConfiguredName, 'HDMI 1')
        .setCharacteristic(this.Characteristic.IsConfigured, this.Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(this.Characteristic.InputSourceType, this.Characteristic.InputSourceType.HDMI);
    tvService.addLinkedService(hdmi1InputService); // link to tv service

    // HDMI 2 Input Source
    const hdmi2InputService = this.tvAccessory.addService(this.Service.InputSource, 'hdmi2', 'HDMI 2');
    hdmi2InputService
        .setCharacteristic(this.Characteristic.Identifier, 2)
        .setCharacteristic(this.Characteristic.ConfiguredName, 'HDMI 2')
        .setCharacteristic(this.Characteristic.IsConfigured, this.Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(this.Characteristic.InputSourceType, this.Characteristic.InputSourceType.HDMI);
    tvService.addLinkedService(hdmi2InputService); // link to tv service

    // TV Input Source
    const tvInputService = this.tvAccessory.addService(this.Service.InputSource, 'tv', 'TV');
    tvInputService
        .setCharacteristic(this.Characteristic.Identifier, 3)
        .setCharacteristic(this.Characteristic.ConfiguredName, 'TV')
        .setCharacteristic(this.Characteristic.IsConfigured, this.Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(this.Characteristic.InputSourceType, this.Characteristic.InputSourceType.HDMI);
    tvService.addLinkedService(tvInputService); // link to tv service

    //               Seconds
    var that = this;
    var active = false;
    this.loewe.fetchCurrentState(function (data){
      if(data["m:Power"] === "idle"){
        // ist aus
        console.log("TV ist aus.")
        active = false
        //tvService.setCharacteristic(this.Characteristic.Active, 0)
      }
      if(data["m:Power"] === "tv"){
        // ist an
        console.log("TV ist an.")
        active = true
        //tvService.setCharacteristic(this.Characteristic.Active, 1)
      }
      console.log(data)
    })

    //tvService.getCharacteristic(this.Characteristic.Active).updateValue(Characteristic.Active.ACTIVE);

    //

    /**
     * Publish as external accessory
     * Only one TV can exist per bridge, to bypass this limitation, you should
     * publish your TV as an external accessory.
     */

    this.api.publishExternalAccessories(PLUGIN_NAME, [this.tvAccessory]);
  }


}