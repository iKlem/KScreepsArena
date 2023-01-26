import { getObjectsByPrototype } from 'game/utils';
import { Creep } from 'game/prototypes';
import { ATTACK, HEAL, RANGED_ATTACK, ERR_NOT_IN_RANGE } from 'game/constants';
import { } from 'arena';

export function loop() {
    /** @type {Array<Creep>} */
    const my_creeps = getObjectsByPrototype(Creep).filter(creep => creep.my)
    const ennemy_creeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    const Thobias = ennemy_creeps[0];

    my_creeps.forEach((creep) => {
        // CREEP d'attaque
        if (creep.body.some(body_parts => body_parts.type == ATTACK)) {
            if (creep.attack(Thobias) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Thobias);
            }
        }

        // CREEP guerrisseur
        if (creep.body.some(body_parts => body_parts.type == HEAL)) {
            const damaged_creeps = my_creeps.filter(creep => creep.hits < creep.hitsMax);
            damaged_creeps.forEach((d_creep) => {
                if (creep.heal(d_creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(d_creep);
                }
            });
        }

        // CREEP attaque a distance
        if (creep.body.some(body_parts => body_parts.type == RANGED_ATTACK)) {
            if (creep.rangedAttack(Thobias) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Thobias);
            }
        }
    });
}
