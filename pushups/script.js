new Vue({
    el: '#app',
    data: {
        pushupsToDo: 0,
        pushupsDone: 0,
        interval: 0,
        pushups: 0,
        totalTime: 0,
        intervalId: null,
        counting: false,
        remainingTime: 0,
        challengeStart: null,
        currentRemainingTime: 0
    },
    computed: {
        challengeEnd() {
            let end = new Date(this.challengeStart);
            end.setHours(end.getHours() + this.totalTime);
            return end;
        },
        progressInfo() {
            switch (this.getProgress()) {
                case -1: return "You have work to do!"
                case 0: return "Perfect!"
                case 1: return "Slow down"
            }
        },
        backgroundColor() {
            if (!this.counting) return "lightgray"
            switch (this.getProgress()) {
                case -1: return "lightsalmon"
                case 0: return "lightgreen"
                case 1: return "palegoldenrod"
            }
        }
    },
    methods: {
        startCounter() {
            this.challengeStart = new Date();
            this._start();
            this._playSound();
            this.save();
        },
        _start() {
            const intervalMilliseconds = this.interval * 60 * 1000;

            let currentTime = Date.now();
            let diff = currentTime - this.challengeStart.getTime();
            if (diff == 0) {
                this.pushupsToDo = this.pushups
            } else {
                this.pushupsToDo = this.pushups * (Math.ceil(diff / intervalMilliseconds));
            }

            this.currentRemainingTime = intervalMilliseconds - (diff % intervalMilliseconds);

            this.intervalId = setInterval(() => {
                this.currentRemainingTime -= 1000;
                if (this.currentRemainingTime <= 0) {
                    this.currentRemainingTime = intervalMilliseconds;
                    this.pushupsToDo += this.pushups;
                    this._playSound();
                }

                if (new Date() > this.challengeEnd) {
                    clearInterval(this.intervalId);
                    this.counting = false;
                    alert('Workout Completed!');
                }
            }, 1000);

            this.counting = true;
        },
        _setDefault() {
            this.interval = 5;
            this.pushups = 10;
            this.totalTime = 7;
        },
        _playSound(){
            const audio = new Audio("shot.mp3");
            audio.play();
        },
        increasePushups(n) {
            this.pushupsDone += n;
            this.save();
        },
        formatTime(ms) {
            const minutes = Math.floor(ms / (60 * 1000));
            const seconds = Math.floor((ms % (60 * 1000)) / 1000);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
        getProgress() {
            if (this.pushupsToDo == this.pushupsDone) {
                return 0;
            } else if (this.pushupsDone < this.pushupsToDo) {
                return -1;
            } else {
                return 1;
            }
        },
        save() {
            localStorage.setItem("data", JSON.stringify({
                interval: this.interval,
                challengeStart: this.challengeStart.getTime(),
                pushups: this.pushups,
                totalTime: this.totalTime,
                pushupsDone: this.pushupsDone
            }));
        },
        recover(data) {
            this.challengeStart = new Date(data.challengeStart);
            this.totalTime = data.totalTime;
            if (this.challengeEnd < new Date()) {
                this._setDefault();
            } else {
                this.interval = data.interval;
                this.pushups = data.pushups;
                this.totalTime = data.totalTime;
                this.pushupsDone = data.pushupsDone;

                this._start();
            }
        },
        restart() {
            clearInterval(this.intervalId)
            this.intervalId = null;
            this.pushupsDone = 0;
            this.pushupsToDo = 0;
            this.counting = false;
            this._setDefault();
        }
    },
    created() {
        let data = localStorage.getItem("data");
        if (data)
            this.recover(JSON.parse(data));
        else {
            localStorage.clear();
            this._setDefault();
        }
    }
});
