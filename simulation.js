const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth*0.8
canvas.height = window.innerHeight*0.8

let settings = {
    "friction" : document.getElementById("frictionInput").value,
    "freezeState" : false,
    "gravity" : document.getElementById("gravityInput").value,
}

document.getElementById("frictionInput").addEventListener("change",(e)=>{settings.friction = e.target.value})

document.getElementById("freezeButton").addEventListener("click",(e)=>{
    if(!settings.freezeState){
        settings.freezeState = true
        document.getElementById("freezeButton").textContent = "Unfreeze"
    }else{
        settings.freezeState = false
        document.getElementById("freezeButton").textContent = "Freeze"
    }
})

document.getElementById("gravityInput").addEventListener("change",(e)=>{settings.gravity = e.target.value})

class Particule {
    constructor(x, y, vx, vy, rayon, couleur) {
        this.x = x;       // Position x
        this.y = y;       // Position y
        this.vx = vx;     // Vitesse en x
        this.vy = vy;     // Vitesse en y
        this.newVx = null
        this.newVy = null
        this.rayon = rayon;
        this.couleur = couleur;
        this.freeze = false
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rayon, 0, Math.PI * 2, false);
        ctx.fillStyle = this.couleur;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.vy += settings.gravity/25
        if(this.x + this.vx + this.rayon > canvas.width || this.x + this.vx - this.rayon < 0){//si on atteind un bord
            this.vx *= -1  // Inverser la vitesse
        }
        if(this.y + this.vy + this.rayon > canvas.height || this.y + this.vy - this.rayon < 0){//si on atteind un bord
            this.vy *= -1 // Inverser la vitesse
        }
        this.checkCollision()
        this.vy -= this.vy*(settings.friction/1000)
        this.vx -= this.vx*(settings.friction/1000)
    }

    checkCollision(){
        for (let i = 0; i < game.objets.length; i++) {
            if(game.objets[i] == this)continue
            var dx = this.x - game.objets[i].x
            var dy = this.y - game.objets[i].y
            var distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < game.objets[i].rayon + this.rayon) {
                // Collision détectée
                const angle = Math.atan2(dy, dx)
                this.newVx = game.objets[i].vx
                this.newVy = game.objets[i].vy
            }
        }
    }
}

class Game{
    constructor(){
        this.objets = []
        for (let i = 0; i < 10; i++) {
            const rayon = 20;
            const x = Math.random() * (canvas.width - 2 * rayon) + rayon;
            const y = Math.random() * (canvas.height - 2 * rayon) + rayon;
            const vx = (Math.random() - 0.5) * 10
            const vy = (Math.random() - 0.5) * 10
            const couleur = 'blue';
            this.objets.push(new Particule(x, y, vx, vy, rayon, couleur));
        }
    }

    moveObject(){
        if(settings.freezeState){
            return
        }
        for(let i = 0;i<this.objets.length;i++){
            if(this.objets[i].newVx != null){
                this.objets[i].vx = this.objets[i].newVx
                this.objets[i].newVx = null
            }
            if(this.objets[i].newVy != null){
                this.objets[i].vy = this.objets[i].newVy
                this.objets[i].newVy = null
            }
            this.objets[i].y += this.objets[i].vy
            this.objets[i].x += this.objets[i].vx
        }
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