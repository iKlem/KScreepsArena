import { getObjectsByPrototype } from 'game/utils';
import { Creep } from 'game/prototypes';
import { ERR_NOT_IN_RANGE } from 'game/constants';
import { } from 'arena';

export function loop() {
    const my_creeps = getObjectsByPrototype(Creep).filter(creep => creep.my)
    const ennemy_creeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    const Thobias = ennemy_creeps[0];
    const Nico = my_creeps[0];

    if (Nico.attack(Thobias) == ERR_NOT_IN_RANGE) {
        Nico.moveTo(Thobias);
    }
}

// const cond = true;

// //  SI  cond est  vrai
//     if (cond  ==  true) {
//         // "faire ça"
//     } else {
//         // "faire ceci"
//     }

// //  SI  cond est vrai
//     if    (cond) {
//         // "faire ça"
//     } else {
//         // "faire ceci"
//     }

// //  SI  cond est   faux
//     if (cond  ==  false) {
//         // "faire ceci"
//     } else {
//         // "faire ça"
//     }

// //  SI  cond est faux
//     if    (!cond) {
//         // "faire ceci"
//     } else {
//         // "faire ça"
//     }

/*
    si "cond" est vrai alors
        faire ça
    sinon alors
        faire ceci
    fin si
*/
