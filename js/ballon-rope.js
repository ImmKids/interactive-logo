class Particle {
  constructor(x, y, isLocked = false) {
      this.position = { x, y };
      this.prevPos = { x, y };
      this.isLocked = isLocked;
  }

  update(dt, gravity) {
      if (this.isLocked) return;

      const tempPos = { ...this.position };
      const velocityX = this.position.x - this.prevPos.x;
      const velocityY = this.position.y - this.prevPos.y + gravity * 0.5 * dt;

      this.prevPos = tempPos;

      this.position.x += velocityX;
      this.position.y += velocityY;
  }
}

export class BallonRope {
  constructor({ numParticles, segmentLength, compliance, gravity, iterations, buoyancyForce }) {
      this.numParticles = numParticles;
      this.segmentLength = segmentLength;
      this.compliance = compliance;
      this.gravity = gravity;
      this.iterations = iterations;
      this.buoyancyForce = buoyancyForce;
      this.particles = [];
      this.createParticles();
  }

  createParticles() {
      for (let i = 0; i < this.numParticles; i++) {
          const x = 0;
          const y = -i * this.segmentLength;
          const isLocked = (i === 0); // Lock the first particle
          this.particles.push(new Particle(x, y, isLocked));
      }
  }

  updateStartPoint(newStartTip, applyDeltaToAll = true) {
      const startParticle = this.particles[0];

      const deltaX = newStartTip.x - startParticle.position.x;
      const deltaY = newStartTip.y - startParticle.position.y;

      if (applyDeltaToAll) {
          this.particles.forEach(particle => {
              particle.position.x += deltaX;
              particle.position.y += deltaY;
              particle.prevPos.x += deltaX;
              particle.prevPos.y += deltaY;
          });
      } else {
          startParticle.position.x = newStartTip.x;
          startParticle.position.y = newStartTip.y;
      }
  }

  applyConstraints() {
      for (let i = 0; i < this.numParticles - 1; i++) {
          const p1 = this.particles[i];
          const p2 = this.particles[i + 1];
          const dx = p2.position.x - p1.position.x;
          const dy = p2.position.y - p1.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const difference = this.segmentLength - distance;
          const complianceFactor = this.compliance / (1 + this.compliance);
          const correction = difference / (distance * (1 + complianceFactor));

          const offsetX = dx * correction * 0.5;
          const offsetY = dy * correction * 0.5;

          if (!p1.isLocked) {
              p1.position.x -= offsetX;
              p1.position.y -= offsetY;
          }
          if (!p2.isLocked) {
              p2.position.x += offsetX;
              p2.position.y += offsetY;
          }
      }
  }

  updateParticles(dt) {
      this.particles.forEach((particle, index) => {
          if (index !== 0) {
              particle.update(dt, -this.gravity);
          }
      });

      // Apply balloon forces to the last particle
      const lastParticle = this.particles[this.numParticles - 1];

      // Apply upward buoyancy force (balloon pulling the last particle upward)
      lastParticle.position.y -= this.buoyancyForce * dt;
  }


  // Apply the impulse to the last particle's position
  applyImpulse(x, y) {
    const lastParticle = this.particles[this.numParticles - 1];
    lastParticle.position.x += x;
    lastParticle.position.y += y;
}

  getParticlePositions() {
      return this.particles.map(p => ({ x: p.position.x, y: p.position.y }));
  }

  simulate(dt) {
      for (let i = 0; i < this.iterations; i++) {
          this.updateParticles(dt);
          for (let j = 0; j < 10; j++) {
              this.applyConstraints();
          }
      }
  }
}
