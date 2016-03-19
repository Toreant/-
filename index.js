/**
 * Created by apache on 16-3-20.
 */
var program = require('commander');
var fn = require('./main');

program
    .version('0.1.0')
    .option('-s, --save', 'save the count')
    .option('-d, --delete [index | count]', 'delete the count')
    .option('-l, --list', 'show the saved count list')
    .option('-u, --user [value]','the user')
    .option('-p, --password [value]','the user password')
    .option('-i, --index [num]','select the number count')
    .parse(process.argv);

var count = program.user,
    password = program.password;

if(program.save) {
    if(count && password) {
        fn('s',count,password);
    } else {
        console.log('no data');
    }
} else if(program.delete) {

} else if(program.list) {
    fn('l');
} else {
    fn('',null,null,program.index);
}