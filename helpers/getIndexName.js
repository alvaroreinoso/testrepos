module.exports.getIndexName = async (model) => {

    const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    const modelName = model.constructor.getTableName()
    const indexName = camelToSnakeCase(modelName.toLowerCase().slice(0, -1))

    return indexName
}

// const index = getIndexName('Messages')

// console.log(index)