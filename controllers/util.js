//quitamos acentos
exports.removeAccents=function(str) {
    return str
        .replace(/[áàãâä]/gi, "a")
        .replace(/[éè¨ê]/gi, "e")
        .replace(/[íìïî]/gi, "i")
        .replace(/[óòöôõ]/gi, "o")
        .replace(/[úùüû]/gi, "u");
}

//
exports.shortName=function(str)
{
return str.substring(0, 10);
}
