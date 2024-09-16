const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth*0.8;
canvas.height = window.innerHeight*0.8;

// Variables pour stocker des objets de la simulation
let objets = [];

// Fonction pour lancer l'animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Effacer le canvas à chaque frame
    objets.forEach(objet => {
        objet.update();
        objet.draw();
    });
    requestAnimationFrame(animate);  // Appel récursif pour une animation continue
}

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
        if(settings.freezeState){
            return
        }
        this.vy += settings.gravity/25
        if(this.x + this.vx + this.rayon > canvas.width || this.x + this.vx - this.rayon < 0){//si on atteind un bord
            this.vx = -this.vx;  // Inverser la vitesse
        }else{
            this.x += this.vx;
        }
        if(this.y + this.vy + this.rayon > canvas.height || this.y + this.vy - this.rayon < 0){//si on atteind un bord
            this.vy = -this.vy;  // Inverser la vitesse
        }else{
            this.y += this.vy;
        }
        this.vy -= this.vy*(settings.friction/1000)
        this.vx -= this.vx*(settings.friction/1000)
    }
}

// Ajouter des particules dans la simulation
for (let i = 0; i < 10; i++) {
    const rayon = 20;
    const x = Math.random() * (canvas.width - 2 * rayon) + rayon;
    const y = Math.random() * (canvas.height - 2 * rayon) + rayon;
    const vx = (Math.random() - 0.5) * 10;
    const vy = (Math.random() - 0.5) * 10;
    const couleur = 'blue';
    objets.push(new Particule(x, y, vx, vy, rayon, couleur));
}

function detecterCollisions() {

}

// Appel à la détection des collisions dans l'animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    detecterCollisions();
    objets.forEach(objet => {
        objet.update();
        objet.draw();
    });
    requestAnimationFrame(animate);
}

// Démarrer l'animation
animate();