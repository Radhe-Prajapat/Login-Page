const rope = document.getElementById('ropeHandle');
const knob = document.getElementById('knobElement');
const ropePathBg = document.getElementById('ropePathBg');
const ropePathFg = document.getElementById('ropePathFg');
const formHeaderP = document.querySelector('.form-header p');
const loginBtn = document.querySelector('.login-btn');

let isDragging = false;
let hasDragged = false;
let startY = 0;
let startX = 0;
let isLightOn = false;

gsap.defaults({ ease: "power2.out" });

let ropePoints = {
    startX: 100, startY: 0,
    cx: 100, cy: 40,
    endX: 100, endY: 80
};

function updateRope() {
    const d = `M ${ropePoints.startX} ${ropePoints.startY} Q ${ropePoints.cx} ${ropePoints.cy} ${ropePoints.endX} ${ropePoints.endY}`;
    ropePathBg.setAttribute('d', d);
    ropePathFg.setAttribute('d', d);
    
    // Position knob exactly at the end of the curve
    gsap.set(knob, { x: ropePoints.endX - 100, y: ropePoints.endY - 80 });
}

// Initial draw
updateRope();

rope.addEventListener('mousedown', startDrag);
rope.addEventListener('touchstart', startDrag, {passive: false});

function startDrag(e) {
    isDragging = true;
    hasDragged = false;
    startY = e.clientY || (e.touches && e.touches[0].clientY);
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    document.body.style.cursor = 'grabbing';
}

window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', drag, {passive: false});

function drag(e) {
    if (!isDragging) return;
    if(e.type === 'touchmove') e.preventDefault();
    
    let y = e.clientY || (e.touches && e.touches[0].clientY);
    let x = e.clientX || (e.touches && e.touches[0].clientX);
    
    let pullY = Math.max(0, Math.min(y - startY, 100)); 
    let pullX = Math.max(-80, Math.min(x - startX, 80)); 
    
    if (pullY > 5 || Math.abs(pullX) > 5) hasDragged = true;
    
    let targetCx = 100 + (pullX * 0.3); // Curve trails behind the pull
    let targetCy = 40 + (pullY * 0.5);
    
    gsap.to(ropePoints, {
        endX: 100 + pullX,
        endY: 80 + pullY,
        cx: targetCx,
        cy: targetCy,
        duration: 0.1,
        onUpdate: updateRope
    });
}

window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = 'default';
    
    let pullDistance = ropePoints.endY - 80;
    if (pullDistance > 45) {
        toggleLight();
    }
    
    // The Magic: Extremely elastic bounce back for a real rope wiggle effect
    gsap.to(ropePoints, {
        endX: 100,
        endY: 80,
        cx: 100, 
        cy: 40, 
        duration: 1.8,
        ease: "elastic.out(1.2, 0.12)", 
        onUpdate: updateRope
    });
}

rope.addEventListener('click', (e) => {
    if (hasDragged) return; 
    
    const pullTl = gsap.timeline({ onUpdate: updateRope });
    
    pullTl.to(ropePoints, { endX: 110, endY: 140, cx: 105, cy: 70, duration: 0.15, ease: "power1.in" })
          .call(toggleLight)
          .to(ropePoints, { endX: 100, endY: 80, cx: 100, cy: 40, duration: 1.8, ease: "elastic.out(1.2, 0.12)" });
});

function toggleLight() {
    isLightOn = !isLightOn;
    
    if (isLightOn) {
        document.body.classList.add('light-on');
        formHeaderP.innerText = "Enter your credentials";
    } else {
        document.body.classList.remove('light-on');
        formHeaderP.innerText = "Pull the rope to illuminate";
    }
    
    const tl = gsap.timeline();
    
    if (isLightOn) {
        tl.to('.bulb', { background: '#fff9e6', boxShadow: '0 0 20px #ffeaa7, 0 0 50px #fdcb6e', duration: 0.1 })
          .to('.light-glow', { opacity: 1, filter: 'blur(20px)', duration: 0.4 }, "<")
          .to('.bg-light', { opacity: 1, duration: 0.5 }, "<")
          .to('.login-form', { opacity: 1, boxShadow: '-10px -10px 20px rgba(255,255,255,0.03), 10px 10px 30px rgba(0,0,0,0.8)', duration: 0.5 }, "<0.1")
          .to('.knob', { background: 'linear-gradient(135deg, #f1c40f, #d35400)', boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.5)', duration: 0.3 }, "<");
    } else {
        tl.to('.bulb', { background: '#222', boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.8)', duration: 0.1 })
          .to('.light-glow', { opacity: 0, filter: 'blur(30px)', duration: 0.3 }, "<")
          .to('.bg-light', { opacity: 0, duration: 0.4 }, "<")
          .to('.login-form', { opacity: 0.1, boxShadow: '-5px -5px 10px rgba(255,255,255,0.01), 5px 5px 10px rgba(0,0,0,0.5)', duration: 0.4 }, "<")
          .to('.knob', { background: 'linear-gradient(135deg, #555, #222)', boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.1)', duration: 0.3 }, "<");
    }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!isLightOn) return; 
    
    const originalText = loginBtn.innerText;
    loginBtn.innerText = "Authenticating...";
    
    gsap.to(loginBtn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
            loginBtn.innerText = "Success!";
            gsap.to(loginBtn, { background: "#d4af37", color: "#111", duration: 0.3 });
            
            setTimeout(() => {
                loginBtn.innerText = originalText;
                gsap.to(loginBtn, { clearProps: "all", duration: 0.3 });
            }, 2000);
        }
    });
});
