const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

class Demo extends Phaser.Scene {
    constructor() {
        super({
            key: 'examples'
        })
    }

    preload() {
        this.load.image('user', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/person.png');
        this.load.image('password', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/key.png');
      
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });        
    }

    create() {
        var print = this.add.text(0, 0, '');

       var loginDialog = CreateLoginDialog(this, {
            x: 400,
            y: 300,
            title: 'Welcome',
            username: 'abc',
            password: '123',
        })
            .on('login', function (username, password) {
                print.text += `${username}:${password}\n`;
            })
            //.drawBounds(this.add.graphics(), 0xff0000);
            .popUp(500);
      
        this.add.text(0, 560, 'Click user name or password field to edit it\nClick Login button to show user name and password')
    }

    update() { }
}

const GetValue = Phaser.Utils.Objects.GetValue;
var CreateLoginDialog = function (scene, config, onSubmit) {
    var username = GetValue(config, 'username', '');
    var password = GetValue(config, 'password', '');
    var title = GetValue(config, 'title', 'Welcome');
    var x = GetValue(config, 'x', 0);
    var y = GetValue(config, 'y', 0);
    var width = GetValue(config, 'width', undefined);
    var height = GetValue(config, 'height', undefined);

    var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_PRIMARY);
    var titleField = scene.add.text(0, 0, title);
    var userNameField = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT),
        icon: scene.add.image(0, 0, 'user'),
        text: scene.rexUI.add.BBCodeText(0, 0, username, { fixedWidth: 150, fixedHeight: 36, valign: 'center' }),
        space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
    })
        .setInteractive()
        .on('pointerdown', function () {
            var config = {
                onTextChanged: function(textObject, text) {
                    username = text;
                    textObject.text = text;
                }
            }
            scene.rexUI.edit(userNameField.getElement('text'), config);
        });

    var passwordField = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT),
        icon: scene.add.image(0, 0, 'password'),
        text: scene.rexUI.add.BBCodeText(0, 0, markPassword(password), { fixedWidth: 150, fixedHeight: 36, valign: 'center' }),
        space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
    })
        .setInteractive()
        .on('pointerdown', function () {
            var config = {
                type: 'password',
                text: password,
                onTextChanged: function(textObject, text) {
                    password = text;
                    textObject.text = markPassword(password);
                }
            };
            scene.rexUI.edit(passwordField.getElement('text'), config);
        });

    var loginButton = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_LIGHT),
        text: scene.add.text(0, 0, 'Login'),
        space: { top: 8, bottom: 8, left: 8, right: 8 }
    })
        .setInteractive()
        .on('pointerdown', function () {
            loginDialog.emit('login', username, password);
        });

    var loginDialog = scene.rexUI.add.sizer({
        orientation: 'y',
        x: x,
        y: y,
        width: width,
        height: height,
    })
        .addBackground(background)
        .add(titleField, 0, 'center', { top: 10, bottom: 10, left: 10, right: 10 }, false)
        .add(userNameField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
        .add(passwordField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
        .add(loginButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
        .layout();
    return loginDialog;
};
var markPassword = function (password) {
    return new Array(password.length + 1).join('•');
};

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true
    },
    scene: Demo
};

var game = new Phaser.Game(config);