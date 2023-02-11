import { getObjectById, getObjectsByPrototype } from 'game/utils';
import { Creep, StructureContainer, StructureSpawn } from 'game/prototypes';
import { ATTACK, CARRY, ERR_NOT_IN_RANGE, HEAL, RANGED_ATTACK, RESOURCE_ENERGY, WORK } from 'game/constants';
// @ts-ignore
import { } from 'arena';
import { attack_max_range, population, unit_definitions } from './config.mjs';

/** @type {StructureContainer[]} */
let containers;

/** @type {StructureSpawn} */
let my_spawn = null;

export function loop() {
	if (!my_spawn) {
		my_spawn = get_spawn();
	}

	containers = getObjectsByPrototype(StructureContainer).filter(c => c.store.getUsedCapacity() != 0);

	// CLEANING CREEPS
	population.forEach((creeps, type) => population.set(type, creeps.filter(c => !check_if_dead(c))))

	// CREEPS ACTIONS
	population.get("worker").forEach(creep => do_work(creep));
	population.get("melee").forEach(creep => do_melee_attack(creep));
	population.get("archer").forEach(creep => do_ranged_attack(creep));
	population.get("healer").forEach(creep => do_heal_unit(creep));

	// SPAWNING
	do_spawn();
}

function get_spawn() {
	const tmp_spawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
	if (tmp_spawn) {
		return tmp_spawn;
	}
	return null;
}

function do_spawn() {
	let spawning = false;
	unit_definitions.some((unit_data) => {
		const units_of_type = population.get(unit_data.type);
		if (units_of_type.length < unit_data.max) {
			const new_creep = my_spawn.spawnCreep(unit_data.body);
			if (new_creep.object) {
				console.log(`Creation en cours de ${unit_data.type}`)
				units_of_type.push(new_creep.object);
				population.set(unit_data.type, units_of_type);
				spawning = true;
				return spawning;
			}
		}
		if (spawning) return spawning;
	});
}


/**
 * @param {Creep} creep
 * @param {import('game/prototypes').BodyPartType} body_type
 */
const check_creep_valid = (creep, body_type) => creep.id && creep.my && creep.body.find(b => b.type == body_type);
/** @param {Creep} creep */
const check_if_dead = (creep) => !creep.hits;

/** @param {Creep} creep */
function do_ranged_attack(creep) {
	if (!check_creep_valid(creep, RANGED_ATTACK)) {
		return false;
	}

	const enemies = getObjectsByPrototype(Creep).filter(creep => !creep.my)
	const nearest_enemy = creep.findClosestByPath(enemies);
	if (nearest_enemy && creep.getRangeTo(nearest_enemy) < attack_max_range) {
		if (creep.rangedAttack(nearest_enemy) === ERR_NOT_IN_RANGE) {
			creep.moveTo(nearest_enemy);
		}
	} else {
		const nearest_enemy_spawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
		if (nearest_enemy_spawn) {
			if (creep.rangedAttack(nearest_enemy_spawn) == ERR_NOT_IN_RANGE) {
				creep.moveTo(nearest_enemy_spawn);
			}
		}
	}
}

/** @param {Creep} creep */
function do_melee_attack(creep) {
	if (!check_creep_valid(creep, ATTACK)) {
		return false;
	}

	const enemies = getObjectsByPrototype(Creep).filter(creep => !creep.my)
	const nearest_enemy = creep.findClosestByPath(enemies);
	if (nearest_enemy && creep.getRangeTo(nearest_enemy) < attack_max_range) {
		if (creep.attack(nearest_enemy) === ERR_NOT_IN_RANGE) {
			creep.moveTo(nearest_enemy);
		}
	} else {
		const nearest_enemy_spawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
		if (nearest_enemy_spawn) {
			if (creep.attack(nearest_enemy_spawn) == ERR_NOT_IN_RANGE) {
				creep.moveTo(nearest_enemy_spawn);
			}
		}
	}
}

/** @param {Creep} creep */
function do_heal_unit(creep) {
	if (!check_creep_valid(creep, HEAL)) {
		return false;
	}

	const damaged_creeps = get_damaged_creeps();
	if (damaged_creeps.length > 0) {
		if (creep.heal(damaged_creeps[0]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(damaged_creeps[0]);
		}
	} else {
		const melee_buddy = population.get("melee")[0];
		if (melee_buddy) {
			creep.moveTo(melee_buddy);
		}
	}
}

function get_damaged_creeps() {
	let damaged_creeps = [];
	population.forEach(creeps => damaged_creeps = damaged_creeps.concat(creeps.filter(creep => creep.hits < creep.hitsMax)))
	return damaged_creeps;
}

/**
 * @param {Creep} creep
 */
function do_work(creep) {
	if (!check_creep_valid(creep, CARRY)) {
		return false;
	}

	if (creep.store.getFreeCapacity(RESOURCE_ENERGY)) { // Si le Creep a de la place --> != 0 --> false
		const nearest_container = creep.findClosestByRange(containers);
		if (nearest_container) {
			if (creep.withdraw(nearest_container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(nearest_container);
			}
		}
	} else { // Si nous avons notre stockage interne plein
		if (creep.transfer(my_spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			creep.moveTo(my_spawn);
		}
	}
}
