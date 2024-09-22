const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth*0.8
canvas.height = window.innerHeight*0.8

let settings = {
    "friction" : document.getElementById("frictionInput").value,
    "freezeState" : false,
    "gravity" : document.getElementById("gravityInput").value,
    "collision" : document.getElementById("collisionInput").checked,
    "speed" : document.getElementById("speedInput").value
}

document.getElementById("frictionInput").addEventListener("input",(e)=>{settings.friction = e.target.value})

document.getElementById("freezeButton").addEventListener("click",(e)=>{
    if(!settings.freezeState){
        settings.freezeState = true
        document.getElementById("freezeButton").textContent = "Unfreeze"
    }else{
        settings.freezeState = false
        document.getElementById("freezeButton").textContent = "Freeze"
    }
})

document.getElementById("gravityInput").addEventListener("input",(e)=>{settings.gravity = e.target.value})

document.getElementById("collisionInput").addEventListener("change",(e)=>{settings.collision = e.target.checked})

document.getElementById("speedInput").addEventListener("input",(e)=>{
    settings.speed = e.target.value
    document.getElementById("speedText").textContent = "speed : "+e.target.value
})

document.getElementById("spawnButton").addEventListener("click",(e)=>{
    game.generateBall()
})

let isMousedPressed = false

document.getElementById("canvas").addEventListener("mousedown", async (e)=>{
    isMousedPressed = true
    while(isMousedPressed){
        await new Promise(r => setTimeout(r, 1));
        game.checkDrag()
    }
})

document.getElementById("canvas").addEventListener("mouseup", (e)=>{
    isMousedPressed = false
    let xDiff = mouseX-previousX
    let yDiff = mouseY-previousY
    for(let i = 0;i<game.objets.length;i++){
        if(game.objets[i].dragged){
            game.objets[i].vx = xDiff/2
            game.objets[i].vy = yDiff/2
        }
        game.objets[i].dragged = false
    }
})

let mouseX = null
let mouseY = null
let previousX = null
let previousY = null

window.addEventListener("mousemove", (e)=>{
    previousX = mouseX
    previousY = mouseY
    mouseX = e.clientX
    mouseY = e.clientY
})

class Particule {
    constructor(x, y, vx, vy, rayon, couleur) {
        this.x = x       // Position x
        this.y = y      // Position y
        this.vx = vx     // Vitesse en x
        this.vy = vy     // Vitesse en y
        this.newVx = null
        this.newVy = null
        this.rayon = rayon
        this.couleur = couleur
        this.freeze = false
        this.dragged = false
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rayon, 0, Math.PI * 2, false);
        ctx.fillStyle = this.couleur;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        if(settings.freezeState){
            return
        }
        this.vy += settings.gravity/25
        if(this.x + this.vx + this.rayon > canvas.width || this.x + this.vx - this.rayon < 0){//si on atteind un bord
            this.vx *= -1  // Inverser la vitesse
        }
        if(this.y + this.vy + this.rayon > canvas.height || this.y + this.vy - this.rayon < 0){//si on atteind un bord
            this.vy *= -1 // Inverser la vitesse
        }
        if(settings.collision == true){this.checkCollision()}
        this.vy -= this.vy*(settings.friction/1000)
        this.vx -= this.vx*(settings.friction/1000)
    }

    checkCollision(){
        for (let i = 0; i < game.objets.length; i++) {
            if(game.objets[i] == this)continue
            if(game.checkCollision2Balls(this,game.objets[i])){
                var dx = (this.x + this.vx) - (game.objets[i].x + game.objets[i].vx)
                var dy = (this.y + this.vy) - (game.objets[i].y + game.objets[i].vy)
                // Collision détectée
                const angle = Math.atan2(dy, dx)
                var totalEnergy = Math.abs(game.objets[i].vx) + Math.abs(game.objets[i].vy)
                this.newVx = (totalEnergy * Math.cos(angle))/(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)))
                this.newVy = (totalEnergy * Math.sin(angle))/(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)))
            }
        }
    }
}

class Game{
    constructor(){
        this.objets = []
        for (let i = 0; i < 10; i++) {
            this.generateBall()
        }
    }

    moveObject(){
        for(let i = 0;i<this.objets.length;i++){
            if(settings.freezeState && !this.objets[i].dragged){
                continue
            }
            if(this.objets[i].newVx != null){
                this.objets[i].vx = this.objets[i].newVx
                this.objets[i].newVx = null
            }
            if(this.objets[i].newVy != null){
                this.objets[i].vy = this.objets[i].newVy
                this.objets[i].newVy = null
            }
            if(this.objets[i].y + this.objets[i].vy + this.objets[i].rayon > canvas.height || this.objets[i].y + this.objets[i].vy - this.objets[i].rayon < 0){continue}
            if(this.objets[i].x + this.objets[i].vx + this.objets[i].rayon > canvas.width || this.objets[i].x + this.objets[i].vx - this.objets[i].rayon < 0){continue}
            this.objets[i].y += this.objets[i].vy*settings.speed
            this.objets[i].x += this.objets[i].vx*settings.speed
            if(this.objets[i].dragged){
                var rayon = this.objets[i].rayon
                if(mouseX-(canvas.offsetLeft-canvas.offsetWidth/2)-rayon < 0 || mouseX-(canvas.offsetLeft-canvas.offsetWidth/2)+rayon > canvas.width || mouseY-(canvas.offsetTop)-rayon < 0 || mouseY-(canvas.offsetTop)+rayon > canvas.height){
                    this.objets[i].dragged = false
                    continue
                }else{
                    this.objets[i].x = mouseX-(canvas.offsetLeft-canvas.offsetWidth/2)
                    this.objets[i].y = mouseY-(canvas.offsetTop)
                }
            }
        }
    }

    checkDrag(){
        var relativeX =null
        var relativeY = null
        if(isMousedPressed){
            relativeX = mouseX-(canvas.offsetLeft-canvas.offsetWidth/2)
            relativeY = mouseY-(canvas.offsetTop)
        }
        for(let i = 0;i<this.objets.length;i++){
            if((relativeX >= this.objets[i].x-this.objets[i].rayon && relativeX <= this.objets[i].x+this.objets[i].rayon) && (relativeY >= this.objets[i].y-this.objets[i].rayon && relativeY <= this.objets[i].y+this.objets[i].rayon)){
                var state = true
                for(let j = 0;j<this.objets.length;j++){
                    if(this.objets[j].dragged){
                        state = false
                    }
                }
                if(!state)return
                this.objets[i].dragged = true
            }
        }       
    }

    generateFreeXY(){
        let x = null
        let y = null
        var rayon = 20
        while(true){
            x = Math.random() * (canvas.width - 2 * rayon) + rayon;
            y = Math.random() * (canvas.height - 2 * rayon) + rayon;
            var state = true
            for(let j = 0;j<this.objets.length;j++){
                if(this.objets[j].x == null || this.objets[j].x == NaN || this.objets[j].y == null || this.objets[j].y == NaN)continue
                if((this.objets[j].x + rayon < x - rayon || this.objets[j].x - rayon > x + rayon) || (this.objets[j].y + rayon < y - rayon || this.objets[j].y - rayon > y + rayon)){
                    
                }else{
                    state = false
                }
            }
            if(state){
                return [x,y]
            }
        }
    }

    generateBall(){
        const rayon = 20
        var coord =  this.generateFreeXY()
        const x = coord[0]
        const y = coord[1]
        const vx = (Math.random() - 0.5) * 20
        const vy = (Math.random() - 0.5) * 20
        const couleur = 'blue'
        const particle = new Particule(x, y, vx, vy, rayon, couleur)
        this.objets.push(particle)
    }

    checkCollision2Balls(ball1,ball2){
        var dx = (ball1.x + ball1.vx) - (ball2.x + ball2.vx)
        var dy = (ball1.y + ball1.vy) - (ball2.y + ball2.vy)
        var distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < ball2.rayon + ball1.rayon) {
            return true
            // Collision détectée
        }  
        return false
    }
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.objets.forEach(objet => {
        objet.update();
        objet.draw();
    });
    game.moveObject()
    requestAnimationFrame(animate)
}

let game = new Game()
animate()