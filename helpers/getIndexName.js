module.exports.getIndexName = async (model) => {

    const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    function lowerFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }
      

    const modelName = model.constructor.getTableName()

    const lowerFirst = lowerFirstLetter(modelName)

    const indexName = camelToSnakeCase(lowerFirst.slice(0, -1))

    return indexName
}