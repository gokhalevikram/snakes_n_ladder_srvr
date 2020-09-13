export default class GameModel
{
    
    MAX_VAL = 100
    
    players = {};

    dice_value = 1

    snakes = {
        16: 6,
        46: 25,
        49: 11,
        62: 19,
        64: 60,
        74: 53,
        89: 68,
        92: 88,
        95: 75,
        99: 80
    }

    ladders = {
        2: 38,
        7: 14,
        8: 31,
        15: 26,
        21: 42,
        28: 84,
        36: 44,
        51: 67,
        71: 91,
        78: 98,
        87: 94
    }

    snake_bite = [
        "boohoo",
        "bummer",
        "snake bite",
        "oh no",
        "dang"
    ]
    
    ladder_jump = [
        "woohoo",
        "woww",
        "nailed it",
        "oh my God...",
        "yaayyy"
    ]
    
    setPlayerPos(idx)
    {
        if((this.players[idx].position  + this.dice_value) === this.MAX_VAL)
        {
            this.players[idx].position = this.MAX_VAL // This player won. Set the position accordingly
            return 0
        }
        else
        {
            if((this.players[idx].position + this.dice_value) > this.MAX_VAL)
                return -1 // Need exactly N to win
            else
            {
                this.players[idx].position  += this.dice_value // set new position player
                return -2 // Game to continue as usual    
            }        
        }
    }

    setFinalPos(idx)
    {
        var ret_code
        var cur_pos = this.players[idx].position 
        var new_pos = 0
        
        if (cur_pos in this.snakes)
        {
                new_pos = this.snakes[cur_pos]
                ret_code = -1 // Got snake bite
        }    
        else
        {
            if(this.players[idx].position  in this.ladders)
            {
                new_pos = this.ladders[cur_pos]
                ret_code =  -2 // Got ladder jump
            }
            else
            {
                new_pos = cur_pos
                ret_code = 0 // Neither snake or ladder
            }
        }

        this.players[idx].position  = new_pos
        return ret_code
    }
}