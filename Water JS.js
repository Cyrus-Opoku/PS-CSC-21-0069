// Custom A-Frame components for the Dream Villa scene

// Simple water motion component that gently animates the Y position
// and slightly modulates the water color over time to simulate motion.
AFRAME.registerComponent("water-motion", {
  schema: {
    amplitude: { type: "number", default: 0.08 },
    speed: { type: "number", default: 0.5 },
  },

  init: function () {
    this.baseY = this.el.object3D.position.y;
    this.elapsed = 0;
  },

  tick: function (time, delta) {
    if (!delta) return;
    this.elapsed += delta / 1000;
    const amp = this.data.amplitude;
    const speed = this.data.speed;

    // Vertical bobbing
    const offset = Math.sin(this.elapsed * speed) * amp;
    this.el.object3D.position.y = this.baseY + offset;

    // Subtle color cycling for shimmer
    const t = (Math.sin(this.elapsed * speed * 0.7) + 1) / 2; // 0..1
    const r = 0.1 + 0.05 * t;
    const g = 0.6 + 0.1 * t;
    const b = 0.9 + 0.05 * t;
    const color = `#${this._toHex(r)}${this._toHex(g)}${this._toHex(b)}`;
    this.el.setAttribute("material", "color", color);
  },

  _toHex: function (v) {
    const n = Math.round(Math.min(1, Math.max(0, v)) * 255);
    return n.toString(16).padStart(2, "0");
  },
});

// Floating object helper component. Works together with the physics system.
// Adds an upward force when the object is near the water surface to keep it floating.
AFRAME.registerComponent("floating-object", {
  schema: {
    radius: { type: "number", default: 0.2 },
    strength: { type: "number", default: 0.6 },
    waterY: { type: "number", default: 0.27 },
  },

  tick: function () {
    const body = this.el.body;
    if (!body) return;

    const pos = this.el.object3D.position;
    const distBelow = this.data.waterY - pos.y;

    // If object is near or below water surface, push it up a bit
    if (distBelow > -this.data.radius) {
      const forceMagnitude = this.data.strength * Math.max(0, distBelow + this.data.radius);
      body.applyForce(
        new CANNON.Vec3(0, forceMagnitude, 0),
        new CANNON.Vec3(pos.x, pos.y, pos.z)
      );
    }
  },
});

// Teleport pad component.
// When clicked, teleports the player's rig to the specified target position.
AFRAME.registerComponent("teleport-pad", {
  schema: {
    target: { type: "vec3" },
  },

  init: function () {
    const el = this.el;
    el.addEventListener("click", () => {
      const target = this.data.target;
      const rig = document.querySelector("#rig");
      if (!rig) return;

      // Move rig smoothly to target with a short animation
      const from = rig.getAttribute("position");
      const to = { x: target.x, y: target.y, z: target.z };

      // If the rig already has an animation, remove it first
      if (rig.getAttribute("animation__teleport")) {
        rig.removeAttribute("animation__teleport");
      }

      rig.setAttribute("animation__teleport", {
        property: "position",
        from: `${from.x} ${from.y} ${from.z}`,
        to: `${to.x} ${to.y} ${to.z}`,
        dur: 500,
        easing: "easeInOutQuad",
      });
    });
  },
});

// Subtle bobbing for the parked car to make the scene feel more alive.
AFRAME.registerComponent("car-bob", {
  init: function () {
    this.baseY = this.el.object3D.position.y;
    this.elapsed = 0;
  },

  tick: function (time, delta) {
    if (!delta) return;
    this.elapsed += delta / 1000;
    const offset = Math.sin(this.elapsed * 0.4) * 0.03;
    this.el.object3D.position.y = this.baseY + offset;
    this.el.object3D.rotation.y = 0.03 * Math.sin(this.elapsed * 0.6);
  },
});

