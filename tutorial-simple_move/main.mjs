import { getObjectsByPrototype } from 'game/utils';
import { Creep, Flag } from 'game/prototypes';
import { } from 'game/constants';
import { } from 'arena';

export function loop() {
    const creeps = getObjectsByPrototype(Creep);
    const flags  = getObjectsByPrototype(Flag);

    const Nico = creeps[0];
    const one_flag = flags[0];

    Nico.moveTo(one_flag);

}
