/* ==========================================================================
   CONFIGURABLE COLOR TWEAKS
   ========================================================================== */
const COLOR_PRIMARY = "#000000";  // Base color for nodes & bonds
const COLOR_TEXT    = "#000000";  // Text color

// Mathematically aligned target coordinates derived directly from your SVG geometry
const logoTargets = [
  { topY: 100, botY: 412 }, // Rung 1 (Outer Left)
  { topY: 200, botY: 300 }, // Rung 2
  { topY: 160, botY: 340 }, // Rung 3
  { topY: 88,  botY: 400 }, // Rung 4 (Center Spine)
  { topY: 160, botY: 340 }, // Rung 5
  { topY: 200, botY: 300 }, // Rung 6
  { topY: 100, botY: 412 }  // Rung 7 (Outer Right)
];

const centerY = 250;
const waveAmplitude = 130;

let animState = {
  time: 0,
  waveMix: 0,
  logoMix: 0
};

function setup() {
  for (let i = 0; i < 7; i++) {
    gsap.set(`#n${i}-top`, { opacity: 0 });
    gsap.set(`#n${i}-bot`, { opacity: 0 });
    gsap.set(`#b${i}`, { opacity: 0 });
  }

  // Initial positioning & scaling of the DNA mark
  gsap.set("#dna-mark", { 
    x: 270,                  // Centered horizontally during initial wave
    scale: 0.50,             // Initial wave scale
    transformOrigin: "center center",
    opacity: 1
  });
}

setup();

const tl = gsap.timeline({ onUpdate: updateFrame });

// STEP 1: Reveal 7 main dots sequentially left-to-right
const initialDots = ["#n0-top", "#n1-top", "#n2-bot", "#n3-bot", "#n4-bot", "#n5-top", "#n6-top"];

initialDots.forEach((dotId, i) => {
  tl.to(dotId, {
    opacity: 1,
    duration: 0.15,
    ease: "power1.out"
  }, i * 0.12);
});

tl.to([".bond", ".node"], {
  opacity: 1,
  duration: 0.3
}, 0.8);

// STEP 2: 3D Harmonic Wave Physics
tl.to(animState, {
  waveMix: 1,
  duration: 1.2,
  ease: "power2.out"
}, 0.8);

tl.to(animState, {
  time: Math.PI * 1,
  duration: 1.0,
  ease: "none"
}, 0.8);

// STEP 3: Lock-in to static logo shape (Centered & Geometrically Precise)
tl.to(animState, {
  logoMix: 1,
  duration: 1.8,
  ease: "power3.inOut"
}, "-=1.5");

// STEP 4: Slide Logo left and scale to match target display size
tl.to("#dna-mark", {
  x: 55,
  scale: 0.20,
  duration: 1.5,
  ease: "power3.inOut"
}, "+=0.3");

// STEP 5: Unveil company name cleanly on the right
tl.to("#clip-rect", {
  width: 650,
  duration: 1.2,
  ease: "power2.out"
}, "+=0.1");

function updateFrame() {
  for (let i = 0; i < 7; i++) {
    const topNode = document.getElementById(`n${i}-top`);
    const botNode = document.getElementById(`n${i}-bot`);
    const bond = document.getElementById(`b${i}`);
    const target = logoTargets[i];

    const phase = animState.time + (i * 0.7);
    const waveOffset = Math.sin(phase) * waveAmplitude * animState.waveMix;

    const waveTopY = centerY - waveOffset;
    const waveBotY = centerY + waveOffset;

    const finalTopY = gsap.utils.interpolate(waveTopY, target.topY, animState.logoMix);
    const finalBotY = gsap.utils.interpolate(waveBotY, target.botY, animState.logoMix);

    topNode.setAttribute("cy", finalTopY);
    botNode.setAttribute("cy", finalBotY);

    bond.setAttribute("y1", finalTopY);
    bond.setAttribute("y2", finalBotY);
  }
}
