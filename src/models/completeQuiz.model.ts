module.exports = (sequelize,Sequelize)=>{
    const CompleteQuiz = sequelize.define(
        'CompleteQuiz',{
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
              },
              completeQuiz :{
                type:Sequelize.BOOLEAN,
                allowNull:false
              }
              
        },{
            paranoid:true
        }
    )
    CompleteQuiz.associate= (models)=>{
        CompleteQuiz.belongsTo(models.Quiz,{
            foreignKey:'quiz_id',
            targetKey:'id'  
        })
        CompleteQuiz.belongsTo(models.User,{
            foreignKey:'user_id',
            targetKey:'id'
        })
    }
    return CompleteQuiz
}