'use strict';

module.exports = {
  parseFields,
  parseConditions
}

function parseFields(fields) {
  return fields.split(',')
               .map(field => field.split('.'));
}

function parseConditions(conditions) {
    return conditions.split(',')
                     .filter(cond => cond != '')
                     .map(parseCondition);
}

function parseCondition(condition) {
  let parts = condition.split('=');
  let field = parts[0].split('.');
  let cond = new RegExp('^' + parts[1].replace('%', '.*') + '$');

  return { field, cond };
}