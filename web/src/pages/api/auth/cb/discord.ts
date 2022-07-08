import { NextApiRequest, NextApiResponse } from 'next';
import passport from 'passport';
import { Profile } from 'passport-discord';

import api from '@/api';
import middleware from '@/lib/middleware';
import { Response } from '@/types/api';
import { Session } from '@/types/session';

const discordCallback = async (
  req: NextApiRequest & {
    discord?: { accessToken?: string; profile?: Profile };
  },
  res: NextApiResponse
) => {
  try {
    // Check if we're already logged in
    const user = await api.me(req, res);
    if (user.success && user?.payload) {
      // If User hasn't completed account creation then redirect
      if (user.payload.user?.state !== 'COMPLETE') {
        res.redirect('/profile');
        return;
      }
      res.redirect('/');
      return;
    }

    await middleware(
      req,
      res,
      passport.authenticate('discord', {
        session: false,
        failureRedirect: '/',
        assignProperty: 'discord',
      })
    );

    const r = await fetch(`${process.env.API_URL}/auth/discord`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        // This is from passport
        Authorization: `Bearer ${req?.discord?.accessToken}`,
        cookie: req.headers.cookie || '',
      },
    });
    const json: Response<Session> = await r.json();
    if (r.status !== 200 && r.status !== 201) {
      res.status(r.status).send({ success: false, error: json.error });
      return;
    }

    const cookies = r.headers.get('Set-Cookie');
    if (!cookies || !json.payload) {
      res
        .status(500)
        .send({ success: false, error: 'Failed to fetch session' });
      return;
    }

    const isNewUser = r.status === 201;
    res.setHeader('Set-Cookie', cookies);
    res.redirect(isNewUser ? '/profile' : '/');
    return;
  } catch (e) {
    res.status(401).send({ success: false, error: e });
  }
};

export default discordCallback;
