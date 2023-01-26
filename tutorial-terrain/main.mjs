import { getObjectsByPrototype } from 'game/utils';
import { Creep, Flag } from 'game/prototypes';
import { } from 'game/constants';
import { } from 'arena';

export function loop() {
    const my_creeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    const flags = getObjectsByPrototype(Flag);

    my_creeps.forEach((creep) => {
        creep.moveTo(creep.findClosestByPath(flags));
    });
}
