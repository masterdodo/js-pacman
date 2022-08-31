const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreSpan = document.querySelector('#score')
const movesSpan = document.querySelector('#moves')
const minMovesSpan = document.querySelector('#min_moves')

minMovesSpan.innerHTML = localStorage.getItem('moves') || '/'

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary {
    static width = 40
    static height = 40

    constructor({ position, image }) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw() {
        //c.fillStyle = "blue"
        //c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)

        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.radians < 0 || this.radians > 0.75) {
            this.openRate = -this.openRate
        }

        this.radians += this.openRate
    }
}

class Ghost {
    static speed = 2
    constructor({ position, velocity, color = "red" }) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Pellet {
    constructor({ position }) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class PowerUp {
    constructor({ position }) {
        this.position = position
        this.radius = 8
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'orange'
        c.fill()
        c.closePath()
    }
}


// CODE

let moves = 0

const pellets = []
const powerUps = []
const boundaries = []
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        }, velocity: {
            x: Ghost.speed,
            y: 0
        }
    })
]

const player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
}

let lastKey = ''

let score = 0


const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

map.forEach((row, i) => {
    row.forEach((el, j) => {
        switch (el) {
            case '-':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/pipeHorizontal.png')
                        }))
                break
            case '|':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/pipeVertical.png')
                        }))
                break
            case '1':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/pipeCorner1.png')
                        }))
                break
            case '2':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/pipeCorner2.png')
                        }))
                break
            case '3':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/pipeCorner3.png')
                        }))
                break
            case '4':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/pipeCorner4.png')
                        }))
                break
            case 'b':
                boundaries.push(
                    new Boundary(
                        {
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                            image: createImage('./images/block.png')
                        }))
                break
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./images/capLeft.png')
                    })
                )
                break
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./images/capRight.png')
                    })
                )
                break
            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./images/capBottom.png')
                    })
                )
                break
            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./images/capTop.png')
                    })
                )
                break
            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./images/pipeCross.png')
                    })
                )
                break
            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./images/pipeConnectorTop.png')
                    })
                )
                break
            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./images/pipeConnectorRight.png')
                    })
                )
                break
            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        color: 'blue',
                        image: createImage('./images/pipeConnectorBottom.png')
                    })
                )
                break
            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width,
                            y: i * Boundary.height
                        },
                        image: createImage('./images/pipeConnectorLeft.png')
                    })
                )
                break
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
                break
        }
    })
})

function circleCollideWithRect({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y
        <=
        rectangle.position.y + rectangle.height + padding
        &&
        circle.position.x + circle.radius + circle.velocity.x
        >=
        rectangle.position.x - padding
        &&
        circle.position.y + circle.radius + circle.velocity.y
        >=
        rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x
        <=
        rectangle.position.x + rectangle.width + padding
    )
}

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollideWithRect({
                circle: {
                    ...player, velocity: {
                        x: 0,
                        y: -5
                    }
                },
                rectangle: boundary
            })) {
                player.velocity.y = 0
                break
            }
            else {
                player.velocity.y = -5
            }
        }
    }
    else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollideWithRect({
                circle: {
                    ...player, velocity: {
                        x: -5,
                        y: 0
                    }
                },
                rectangle: boundary
            })) {
                player.velocity.x = 0
                break
            }
            else {
                player.velocity.x = -5
            }
        }
    }
    else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollideWithRect({
                circle: {
                    ...player, velocity: {
                        x: 0,
                        y: 5
                    }
                },
                rectangle: boundary
            })) {
                player.velocity.y = 0
                break
            }
            else {
                player.velocity.y = 5
            }
        }
    }
    else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollideWithRect({
                circle: {
                    ...player, velocity: {
                        x: 5,
                        y: 0
                    }
                },
                rectangle: boundary
            })) {
                player.velocity.x = 0
                break
            }
            else {
                player.velocity.x = 5
            }
        }
    }

    // PLAYER COLLIDES WITH POWERUP
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.draw()

        if (Math.hypot(
            powerUp.position.x - player.position.x,
            powerUp.position.y - player.position.y) < powerUp.radius + player.radius) {
            powerUps.splice(i, 1)

            ghosts.forEach(ghost => {
                ghost.scared = true

                setTimeout(() => {
                    ghost.scared = false
                }, 5000)
            })
        }
    }

    // PLAYER COLLIDES WITH GHOST
    for (let i = ghosts.length - 1; i >= 0; i--) {
        const ghost = ghosts[i];
        if (Math.hypot(
            ghost.position.x - player.position.x,
            ghost.position.y - player.position.y
        ) < ghost.radius + player.radius) {
            if (ghost.scared) {
                ghosts.splice(i, 1);
            }
            else {
                cancelAnimationFrame(animationId);
                console.log("Game Over!")
            }
        }
    }

    // WIN GAME
    if (pellets.length === 0) {
        console.log("WIN")
        cancelAnimationFrame(animationId);
        const min_moves = localStorage.getItem('moves');
        if (moves < min_moves || min_moves === null) {
            localStorage.setItem('moves', moves);
        }
    }

    // PLAYER COLLIDES WITH PALLET
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];

        pellet.draw();

        if (Math.hypot(
            pellet.position.x - player.position.x,
            pellet.position.y - player.position.y) < pellet.radius + player.radius) {
            pellets.splice(i, 1)
            score += 10
            scoreSpan.innerHTML = score
        }
    }

    boundaries.forEach(boundary => {
        boundary.draw()
        if (circleCollideWithRect({
            circle: player,
            rectangle: boundary
        })) {
            player.velocity.x = 0
            player.velocity.y = 0
        }
    })

    player.update()

    // PLAYER COLLIDES WITH GHOST
    ghosts.forEach((ghost, i) => {
        ghost.update();

        const collisions = []
        boundaries.forEach(boundary => {
            if (!collisions.includes('right') &&
                circleCollideWithRect({
                    circle: {
                        ...ghost, velocity: {
                            x: Ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })) {
                collisions.push('right')
            }
            if (!collisions.includes('left') &&
                circleCollideWithRect({
                    circle: {
                        ...ghost, velocity: {
                            x: -Ghost.speed,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })) {
                collisions.push('left')
            }

            if (!collisions.includes('up') &&
                circleCollideWithRect({
                    circle: {
                        ...ghost, velocity: {
                            x: 0,
                            y: -Ghost.speed
                        }
                    },
                    rectangle: boundary
                })) {
                collisions.push('up')
            }

            if (!collisions.includes('down') &&
                circleCollideWithRect({
                    circle: {
                        ...ghost, velocity: {
                            x: 0,
                            y: Ghost.speed
                        }
                    },
                    rectangle: boundary
                })) {
                collisions.push('down')
            }
        })

        if (collisions.length > ghost.prevCollisions.length) {
            ghost.prevCollisions = collisions
        }

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

            if (ghost.velocity.x > 0) {
                ghost.prevCollisions.push('right')
            }
            else if (ghost.velocity.x < 0) {
                ghost.prevCollisions.push('left')
            }
            else if (ghost.velocity.y > 0) {
                ghost.prevCollisions.push('down')
            }
            else if (ghost.velocity.y < 0) {
                ghost.prevCollisions.push('up')
            }

            const pathways = ghost.prevCollisions.filter(coll => {
                return !collisions.includes(coll)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = Ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'up':
                    ghost.velocity.y = -Ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -Ghost.speed
                    break
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = Ghost.speed
                    break
            }

            ghost.prevCollisions = []
        }
    })

    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
}

animate()

addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
        case 'W':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
        case 'A':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
        case 'S':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
        case 'D':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
        case 'W':
            keys.w.pressed = false
            moves += 1
            movesSpan.innerHTML = moves
            break
        case 'a':
        case 'A':
            keys.a.pressed = false
            moves += 1
            movesSpan.innerHTML = moves.toString()
            break
        case 's':
        case 'S':
            keys.s.pressed = false
            moves += 1
            movesSpan.innerHTML = moves
            break
        case 'd':
        case 'D':
            keys.d.pressed = false
            moves += 1
            movesSpan.innerHTML = moves
            break
    }
})