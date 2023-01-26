import { getObjectsByPrototype } from 'game/utils';
import { Creep, Flag, StructureSpawn } from 'game/prototypes';
import { MOVE } from 'game/constants';
import { } from 'arena';

/** @type {Array<Creep>} */
const my_creeps = [];

export function loop() {
    const flags = getObjectsByPrototype(Flag);
    const spawns = getObjectsByPrototype(StructureSpawn).filter(s => s.my);

    spawns.forEach(spawn => {
        const creep = spawn.spawnCreep([MOVE]).object;
        if (creep) {
            my_creeps.push(creep);
        }
    })

    my_creeps.forEach((creep, key) => {
        if (key < flags.length) {
            console.log(creep.moveTo(flags[key]));
        }
    })
}
