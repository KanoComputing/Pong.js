
module.exports = {

    parseOctal: function (color) {
        if (typeof color === 'string') {
            color = '0x' + color.substr(1);
        }
        return color;
    }

};