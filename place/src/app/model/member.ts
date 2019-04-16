export class Member {
    id: string;
    nick = '';
    email = '';
    play = 0;  // 1-play, 0-not play, 3-maybe, 9-decline, 7-empy
    camisole = false;
    ball = false;
    comment = '';

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    toJSON() {
        return Object.assign({}, this);
    }
}
