import Phaser from '../lib/phaser.js'
import GameModel from './GameModel.js';

export default class Game extends Phaser.Scene
{
    /** @type {Phaser.Physics.Arcade.Sprite} */
    player_me
    other_player

    player_me_sprite
    other_player_sprite

    DICE_FACE = 6

    WIN_MSG = "Hooray!! You won! Congratulations!!!"
    EXACT_DICE_MSG = "You need exact value to win! Try again!!"
    NEXT_TURN_MSG = "Next player to take turn !!!"

    // Create new game model that maintains the state for the game
    model = new GameModel()
    
    BOARD_SIZE_IN_SQUARES = 10

    constructor()
    {
        super('game');
    }

    movePlayerFinal(player_pos, player_sprite)
    {
        var new_x_pos = 0
        var new_y_pos = 0
        // var player
        var pos
        var row
        var col

        var x_y_increments // How many inrements of x and y from current position
        const x_step = 2 // move x in steps of 2
        var y_step // move y in y steps
        var x_beg, x_end
        var y_beg, y_end
        var x_step_mult, y_step_mult // multiplier for step

        pos = player_pos
        row = (Math.ceil(pos / 10))

        if(row % 2 === 1)
        {
            if(pos%10 === 0)
                col = pos / row
            else
                col = pos % 10
        }
        else
        {
            if(pos%10 === 0)
                col = 10 - (pos / row) + 1
            else
                col = 10 - (pos % 10) + 1
        }

        new_x_pos = ((col - 1) * (this.board.displayWidth / 10)) + 40
        new_y_pos = ((10 - row) * (this.board.displayHeight / 10)) + 40
   
        if(new_x_pos != player_sprite.x)
        {
            if(new_x_pos > player_sprite.x)
            {
                x_y_increments = (new_x_pos - player_sprite.x) / x_step
                x_beg = player_sprite.x
                x_end = new_x_pos
                x_step_mult = 1 
            }
            else
            {
                x_y_increments = (player_sprite.x - new_x_pos) / x_step
                x_beg = new_x_pos
                x_end = player_sprite.x
                x_step_mult = -1 
            }
        }

        if(new_y_pos != player_sprite.y)
        {
            if(new_y_pos > player_sprite.y)
            {
                y_step = (new_y_pos - player_sprite.y) / x_y_increments
                y_beg = player_sprite.y
                y_end = new_y_pos
                y_step_mult = 1 
            }
            else
            {
                y_step = (player_sprite.y - new_y_pos) / x_y_increments
                y_beg = new_y_pos
                y_end = player_sprite.y
                y_step_mult = -1 
            }
        }

        for(;x_beg < x_end;)
        {
            x_beg += x_step
            player_sprite.x += (x_step * x_step_mult)
            player_sprite.y += (y_step * y_step_mult)
        }

        player_sprite.x = new_x_pos
        player_sprite.y = new_y_pos
    }

    movePlayer(player_pos, player_sprite)
    {
        // var player;
        var pos;
        var row
        var col
        
        console.log('Within movePlayer')

        pos = player_pos

        // console.log(player)
        // console.log('Current player : ', this.model.player_turn_idx)
        console.log('Current pos : ', pos)
        console.log('Current dice val : ', this.model.dice_value)


        for(let i = pos-this.model.dice_value+1; i <= pos; i++)
        {
            //this.addDelay()
            row = (Math.ceil(i / 10))
    
            if(row % 2 === 1)
            {
                if(i%10 === 0)
                    col = i / row
                else
                    col = i % 10
            }
            else
            {
                if(i%10 === 0)
                    col = 10 - (i / row) + 1
                else
                    col = 10 - (i % 10) + 1

            }
            
            player_sprite.x = ((col - 1) * (this.board.displayWidth / 10)) + 40
            player_sprite.y = ((10 - row) * (this.board.displayHeight / 10)) + 40
        }

    }

    preload()
    {
        console.log("Loading image ...");
        this.load.image("board", "src/assets/ULAR.jpg");
        this.load.image("black", "src/assets/pieceBlack_border11.png");
        this.load.image("white", "src/assets/pieceWhite_border11.png");
    }

    create()
    {
        // var old_val
        // var row
        // var col
        var diceValTxt
        var statusTxt
        var jumpTxt
        // var player_idx

        console.log("This is game.js create");
        this.board = this.add.image(400, 400, "board");
        this.board.displayHeight = 800;
        this.board.displayWidth = 800;

        console.log('Adding text')
        this.add.text(825, 25, 'Welcome to Snakes and ladder game. Black takes first turn', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })


        var self = this;
        this.socket = io();
        this.socket.heartbeatTimeout = 20000;
        this.socket.on('currentPlayers', function (players) {
          console.log('currentPlayers ...')
          Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                self.addPlayer(self, players[id])
            }
            else
                self.addOtherPlayer(self, players[id])
          });
        });

        this.socket.on('newPlayer', function (playerInfo) {
            console.log('newPlayer ...', playerInfo.playerId)
            console.log(playerInfo)
            self.addOtherPlayer(self, playerInfo);
        });

        // Create text objects that will be used in the game to display messages
        diceValTxt = this.add.text(825, 50, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
        statusTxt = this.add.text(825, 100, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
        jumpTxt = this.add.text(825, 200, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
        
        // Set board interactive to handle mouse clicks
        this.board.setInteractive();

        this.board.on('pointerup', function (pointer) {
          console.log('Player in pointerup : ', self.model.players[self.socket.id])
          console.log('Client socket id : ', self.socket.id)

          if(self.model.players[self.socket.id].is_active === true) // Only when it is this player's turn
          {
            // Roll dice to get value from 1 to 6            
            this.model.dice_value = Phaser.Math.Between(1, 6)

            // this.add.text(825, 50, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
            diceValTxt.destroy()
            statusTxt.destroy()
            jumpTxt.destroy()

            diceValTxt = this.add.text(825, 50, "You got " + this.model.dice_value + " on dice", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
            
            // Set players position (1 - 100) in model as per dice value, but do not move it on the graphics yet
            var ret = this.model.setPlayerPos(self.socket.id)
            if(ret === 0)
            {   
                statusTxt = this.add.text(825, 100, this.WIN_MSG, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
            }
            else
            {
                if(ret === -1)
                {
                    // this.add.text(825, 100, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                    statusTxt = this.add.text(825, 100, this.EXACT_DICE_MSG, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                }
                else
                {
                    // this.add.text(825, 100, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                    statusTxt = this.add.text(825, 100, this.NEXT_TURN_MSG, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                }
            }

            // Move the player graphics as per position value
            this.movePlayer(self.model.players[self.socket.id].position, self.player_me_sprite)

            // Set final position of player based on snake bite or ladder jump
            ret = this.model.setFinalPos(self.socket.id)
            if(ret === -1)
            {
                // this.add.text(825, 200, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                jumpTxt = this.add.text(825, 200, "Ouch!! Snake bite", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
            }
            else
            {
                if(ret === -2)
                {
                    // this.add.text(825, 200, "", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                    jumpTxt = this.add.text(825, 200, "Wow!! You got a ladder jump!!", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' })
                }
            }   

            // Move player graphics
            this.movePlayerFinal(self.model.players[self.socket.id].position, self.player_me_sprite)

            self.model.players[self.socket.id].is_active = false // Make this player inactive
            this.socket.emit('playerMovement', self.model.players[self.socket.id].position)
        }
      }, this);

        this.socket.on('playerMoved', function (playerInfo) {
            self.model.players[playerInfo.playerId].position = playerInfo.position
            // this.movePlayer(playerInfo.position, self.other_player_sprite)
            self.movePlayerFinal(playerInfo.position, self.other_player_sprite)
            self.model.players[self.socket.id].is_active = true // Make this player active again
        });
    }

    addPlayer(self, playerInfo) 
    {
        console.log('addPlayer ...')
        // Add player to model 
        self.model.players[playerInfo.playerId] = {
            position: playerInfo.position,
            playerId: playerInfo.playerId,
            color: playerInfo.color,
            is_active: playerInfo.is_active
        };

        self.player_me_sprite = self.add.sprite(25, 760, playerInfo.color);
    }

    addOtherPlayer(self, playerInfo) 
    {
        console.log('addOtherPlayer ...')
        // Add player to model 
        self.model.players[playerInfo.playerId] = {
            position: playerInfo.position,
            playerId: playerInfo.playerId,
            color: playerInfo.color,
            is_active: playerInfo.is_active
        };

        self.other_player_sprite = self.add.sprite(50, 760, playerInfo.color);
    }

    update(t, dt)
    {
        
    }
 
}