let data;
let currentQuestion = 0;
let typingTimer = null;
let canvasInstance = null;
let userTraits = {
    courage: 0,
    curiosity: 0,
    loyalty: 0,
    caution: 0,
    risk: 0
};
const intro = document.getElementById("intro");
const storyScreen = document.getElementById("storyScreen");
const questionScreen = document.getElementById("questionScreen");
const resultScreen = document.getElementById("resultScreen");
const startButton = document.getElementById("startButton");
const continueButton = document.getElementById("continueButton");
const restartButton = document.getElementById("restartButton");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const questionNumber = document.getElementById("questionNumber");
const question = document.getElementById("question");
const answers = document.getElementById("answers");
const resultType = document.getElementById("resultType");
const resultDescription = document.getElementById("resultDescription");
fetch("data.json")
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Could not load data.json");
        }
        return response.json();
    })
    .then(function(json) {
        data = json;
        startButton.disabled = false;
        startButton.textContent = "START";
    })
    .catch(function(error) {
        console.error("Could not load data:", error);
        startButton.textContent = "DATA ERROR";
        startButton.disabled = true;
    });
startButton.addEventListener("click", function() {
    if (!data) {
        return;
    }
    resetTraits();
    intro.classList.add("hidden");
    storyScreen.classList.remove("hidden");
    showStory();
});
function showStory() {
    storyTitle.textContent = "OCTOBER 17, 1986";

    const story = `11:47 PM.

The lights in your town suddenly go out.

The phones stop working.
The radio begins broadcasting a strange signal.

Then, people start disappearing.

You hear something moving outside.
Somewhere in the distance, a siren begins to sound.

You do not know what is happening.
You only know that something is wrong.

You have until sunrise to find out what happened — and survive.`;
    typeStory(story);
}
function typeStory(text) {
    if (typingTimer !== null) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    storyText.textContent = "";
    continueButton.disabled = true;
    let i = 0;
    function typeCharacter() {
        if (i < text.length) {
            storyText.textContent += text.charAt(i);
            i++;
            typingTimer = setTimeout(typeCharacter, 25);
        } else {
            storyText.textContent = text;
            typingTimer = null;
            continueButton.disabled = false;
        }
    }
    typeCharacter();
}
continueButton.addEventListener("click", function() {
    if (continueButton.disabled) {
        return;
    }
    if (typingTimer !== null) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    storyScreen.classList.add("hidden");
    questionScreen.classList.remove("hidden");
    currentQuestion = 0;
    showQuestion();
});
function showQuestion() {
    const current = data.questions[currentQuestion];
    questionNumber.textContent =
        "SCENARIO " + (currentQuestion + 1) + " / " + data.questions.length;
    question.textContent = current.question;
    answers.innerHTML = "";
    current.answers.forEach(function(answer) {
        const button = document.createElement("button");
        button.classList.add("answer");
        button.textContent = answer.text;
        button.addEventListener("click", function() {
            applyTraits(answer.traits);
            currentQuestion++;
            if (currentQuestion < data.questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        });
        answers.appendChild(button);
    });
}
function applyTraits(traits) {
    for (let trait in traits) {
        userTraits[trait] += traits[trait];
    }
}
function findResult() {
    let bestType = null;
    let smallestDifference = Infinity;
    data.types.forEach(function(type) {
        let difference = 0;
        for (let trait in userTraits) {
            difference += Math.abs(
                userTraits[trait] - type.traits[trait]
            );
        }
        if (difference < smallestDifference) {
            smallestDifference = difference;
            bestType = type;
        }
    });
    return bestType;
}
function showResult() {
    questionScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    const result = findResult();
    resultType.textContent = result.name;
    resultDescription.textContent = result.description;
    createVisualization();
}
function resetTraits() {
    userTraits = {
        courage: 0,
        curiosity: 0,
        loyalty: 0,
        caution: 0,
        risk: 0
    };
}
restartButton.addEventListener("click", function() {
    resultScreen.classList.add("hidden");
    intro.classList.remove("hidden");
    clearCanvas();
});
function createVisualization() {
    clearCanvas();
    const sketch = function(p) {
        p.setup = function() {
            const canvas = p.createCanvas(500, 500);
            canvas.parent("canvasContainer");
        };
        p.draw = function() {
            p.background(17);
            const centerX = p.width / 2;
            const centerY = p.height / 2;
            const radius = 135;
            const traits = [
                userTraits.courage,
                userTraits.curiosity,
                userTraits.loyalty,
                userTraits.caution,
                userTraits.risk
            ];
            const labels = [
                "COURAGE",
                "CURIOSITY",
                "LOYALTY",
                "CAUTION",
                "RISK"
            ];
            const angles = [];
            for (let i = 0; i < 5; i++) {
                angles.push(
                    -p.HALF_PI + (p.TWO_PI / 5) * i
                );
            }
            const levels = [1, 0.66, 0.33];
            p.noFill();
            p.stroke(55);
            p.strokeWeight(1);
            for (let level of levels) {
                p.beginShape();
                for (let i = 0; i < 5; i++) {
                    const x =
                        centerX +
                        p.cos(angles[i]) * radius * level;

                    const y =
                        centerY +
                        p.sin(angles[i]) * radius * level;

                    p.vertex(x, y);
                }
                p.endShape(p.CLOSE);
            }
            p.fill(255, 255, 255, 45);
            p.stroke(255);
            p.strokeWeight(2);
            p.beginShape();
            for (let i = 0; i < 5; i++) {
                const value = p.constrain(
                    traits[i],
                    0,
                    18
                );
                const distance = p.map(
                    value,
                    0,
                    18,
                    0,
                    radius
                );
                const x =
                    centerX +
                    p.cos(angles[i]) * distance;

                const y =
                    centerY +
                    p.sin(angles[i]) * distance;
                p.vertex(x, y);
            }
            p.endShape(p.CLOSE);
            for (let i = 0; i < 5; i++) {
                const value = p.constrain(
                    traits[i],
                    0,
                    18
                );
                const distance = p.map(
                    value,
                    0,
                    18,
                    0,
                    radius
                );
                const x =
                    centerX +
                    p.cos(angles[i]) * distance;

                const y =
                    centerY +
                    p.sin(angles[i]) * distance;

                p.fill(255);
                p.noStroke();
                p.circle(x, y, 8);
            }
            p.fill(190);
            p.noStroke();
            p.textSize(11);
            p.textAlign(p.CENTER, p.CENTER);
            for (let i = 0; i < 5; i++) {
                const labelDistance = radius + 45;

                const x =
                    centerX +
                    p.cos(angles[i]) * labelDistance;

                const y =
                    centerY +
                    p.sin(angles[i]) * labelDistance;

                p.text(labels[i], x, y);
            }
            p.fill(255);
            p.textSize(13);
            p.textStyle(p.BOLD);
            p.textAlign(p.CENTER, p.CENTER);
            for (let i = 0; i < 5; i++) {
                const value = p.constrain(
                    traits[i],
                    0,
                    18
                );
                const distance = p.map(
                    value,
                    0,
                    18,
                    0,
                    radius
                );
                const scoreDistance = distance + 18;

                const x =
                    centerX +
                    p.cos(angles[i]) * scoreDistance;

                const y =
                    centerY +
                    p.sin(angles[i]) * scoreDistance;

                p.text(
                    traits[i],
                    x,
                    y
                );
            }
            p.fill(255);
            p.noStroke();
            p.circle(centerX, centerY, 4);
            p.textStyle(p.NORMAL);
        };
    };
    canvasInstance = new p5(sketch);
}
function clearCanvas() {
    if (canvasInstance) {
        canvasInstance.remove();
        canvasInstance = null;
    }
    const container = document.getElementById("canvasContainer");
    if (container) {
        container.innerHTML = "";
    }
}