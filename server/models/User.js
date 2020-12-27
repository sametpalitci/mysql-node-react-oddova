module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("users",{
        email:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        }
    })
    return Users;
}