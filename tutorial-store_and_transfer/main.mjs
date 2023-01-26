import { getObjectsByPrototype  } from 'game/utils';
import { Creep, StructureTower, StructureContainer } from 'game/prototypes';
import { RESOURCE_ENERGY, ERR_NOT_IN_RANGE, ERR_NOT_ENOUGH_ENERGY, ERR_NOT_ENOUGH_RESOURCES } from 'game/constants';
import { } from 'arena';

export function loop() {
    const my_creeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    const ennemy_creeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    const my_tower = getObjectsByPrototype(StructureTower).filter(tower => tower.my)[0];
    const my_container = getObjectsByPrototype(StructureContainer)[0];

    const Thobias = ennemy_creeps[0];
    const Nico = my_creeps[0];

    const tower_attack_result = my_tower.attack(Thobias);
    console.log(`Tour attaque Thobias, resultat: ${tower_attack_result}`)
    if (tower_attack_result == ERR_NOT_ENOUGH_ENERGY) {
        const transfer_result = Nico.transfer(my_tower, RESOURCE_ENERGY);
        console.log(`Nico va ajouter de l'energie dans la tour, resultat: ${transfer_result}`)
        if (transfer_result == ERR_NOT_IN_RANGE) {
            Nico.moveTo(my_tower);
        } else if (transfer_result == ERR_NOT_ENOUGH_RESOURCES) {
            const withdraw_result = Nico.withdraw(my_container, RESOURCE_ENERGY);
            console.log(`Nico va chercher de l'energie dans le container, resultat: ${withdraw_result}`)
            if (withdraw_result == ERR_NOT_IN_RANGE) {
                Nico.moveTo(my_container);
            }
        }
    }
}
