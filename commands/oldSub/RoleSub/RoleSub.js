const RoleDb = require('./store/store');
const ADD = 'ADD';
const DELETE = 'DELETE';

module.exports = class RoleSub {
    constructor() {
        this._db = new RoleDb();
    }

    async list(message) {
        let result;
        try {
            result = await this._db.getListAsync(message);
        } catch(err) {
            console.error(err);
        }
        return result;
    }

    async updateRoles(task, message, roleArgs) {
        const result = await this.validateRoles(message, roleArgs);
        if (result.validRoles.length) {
            let response;
            try {
                switch(task) {
                    case ADD:
                        response = await this._db.addRoleAsync(message, result.validRoles);
                        break;
                    case DELETE:
                        response = await this._db.deleteRoleAsync(message, result.validRoles);
                    default:
                        break;
                }
            } catch(err) {
                console.error(err);
            }
            result.response = response;
        }
        return result;
    }

    async validateRoles(message, roleArgs) {
        const result = {};
        result.invalidRoles = [];
        result.validRoles = roleArgs.map(arg => {
            const role = message.guild.roles.find(role => role.name === arg);
            if (role !== null) {
                return role;
            } else {
                result.invalidRoles.push(arg);
                return null;
            }
        }).filter(role => role !== null);
        return result;
    }
};