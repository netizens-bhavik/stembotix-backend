import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { SECRET_KEY } from '.';
import DB from '@/databases';

const { User, Role } = DB;

const opts = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

export default (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwtPayload, cb) => {
      User.findOne({
        where: {
          id: jwtPayload.id,
        },
        include: [
          {
            model: Role,
          },
        ],
      }).then((data, err) => {
        if (err) {
          return cb(err, false);
        }
        if (data) {
          const user = JSON.parse(JSON.stringify(data));
          Reflect.deleteProperty(user, 'password');
          cb(null, user);
        } else {
          cb(null, false);
        }
      });
    })
  );
};
