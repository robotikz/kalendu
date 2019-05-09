import { Place } from './place';
import { Game } from './game';

export class Group {
    id: string;
    title = '';
    avatar = '';
    sport = '';
    min: number;
    max: number;
    deadline: number;
    place_id: string;
    place: Place;
    camisole = false;
    ball = false;
    pay = true;

    status = 1;

    owner: string; // email of owner
    member: string[] = [];  // email of members
    // access ids
    aowner: string;
    amember: string;
    
    // buffer properties
    gamenext: Game;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    toJSON() {
        const r = Object.assign({}, this);
        delete r.gamenext;
        return r;
    }
}
