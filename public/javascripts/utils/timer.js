class Timer {
    constructor(duration, callback) {
        this.duration = duration;
        this.remaining = duration;
        this.timerId = null;
        this.startTime = null;
        this.status = 'stopped';
        this.callback = callback;
        this.onUpdate = null;
    }

    start() {
        if (this.status === 'running') return;

        this.status = 'running';
        this.startTime = Date.now();

        const tick = () => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.remaining = this.duration - elapsed;

            this.onUpdate?.(this.remaining);

            if (this.remaining <= 0) {
                this.stop();
                this.callback?.();
            } else {
                this.timerId = setTimeout(tick, 1000);
            }
        };

        tick();
    }

    pause() {
        if (this.status !== 'running') return;

        this.status = 'paused';
        clearTimeout(this.timerId);
        this.duration = this.remaining;
    }

    reset() {
        this.stop();
        this.remaining = this.duration;
    }

    stop() {
        this.status = 'stopped';
        clearTimeout(this.timerId);
        this.timerId = null;
    }
}

export default Timer;
