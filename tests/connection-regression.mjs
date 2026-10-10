import assert from 'node:assert/strict';
export async function checkConnectionRegression(page) {
        const signalSequence = await page.evaluate(() => {
          const paths = [...document.querySelectorAll('[data-connection-signal]')];
          const animations = paths.map(path => path.getAnimations()[0]);
          animations.forEach(animation => animation.pause());
          const sequence = [];
          let maximum = 0;
          for (let time = 0; time < 12000; time += 20) {
            animations.forEach(animation => { animation.currentTime = time; });
            const visible = paths.map((path, index) => Number(getComputedStyle(path).opacity) > .01 ? index : -1).filter(index => index >= 0);
            maximum = Math.max(maximum, visible.length);
            if (visible.length === 1 && sequence.at(-1) !== visible[0]) sequence.push(visible[0]);
          }
          animations.forEach(animation => { animation.currentTime = 0; animation.play(); });
          return { maximum, sequence };
        });
        assert.equal(signalSequence.maximum, 1, 'Only one cable segment carries the signal at any moment');
        assert.deepEqual(signalSequence.sequence, [0, 1, 2, 0, 1, 2], 'Signal completes the full route before repeating');
        // Opacity alone misses SVG dash wrapping: rasterize the actual browser
        // stroke after it exits each cable and inspect the cable's starting point.
        const trailingFlashes = await page.evaluate(async () => {
          const paths = [...document.querySelectorAll('[data-connection-signal]')];
          const animations = paths.map(path => path.getAnimations()[0]);
          animations.forEach(animation => animation.pause());
          const flashes = [];
          for (const [index, path] of paths.entries()) {
            animations.forEach(animation => { animation.currentTime = (index * .34 + .27) * 6000; });
            const clone = path.cloneNode(true);
            const style = getComputedStyle(path);
            for (const property of ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray', 'stroke-dashoffset', 'opacity']) clone.style.setProperty(property, style.getPropertyValue(property));
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">${new XMLSerializer().serializeToString(clone)}</svg>`;
            const image = new Image();
            image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = 1536; canvas.height = 1024;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            const start = path.getPointAtLength(0);
            const pixels = context.getImageData(Math.round(start.x) - 8, Math.round(start.y) - 8, 16, 16).data;
            flashes.push(pixels.some((value, pixel) => pixel % 4 === 3 && value > 0));
          }
          animations.forEach(animation => { animation.currentTime = 0; animation.play(); });
          return flashes;
        });
        assert.deepEqual(trailingFlashes, [false, false, false], 'A signal leaving a cable must not wrap and flash at its starting point');

}
