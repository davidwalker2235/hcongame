



'use client';

import { Suspense } from 'react';
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { ErniLogo } from '../components/ErniLogo';
import { openAppOrWeb, getSocialLinks } from '../utils/mobileAppLinks';



function AboutContent() {
  const { isVerified, userData, loading } = useUserVerification();

  if (loading || isVerified === null || isVerified === false) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Cargando...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.asciiLogoWrapper}>
            <ErniLogo />
          </div>
          {userData && (
            <div style={{ marginTop: '20px' }}>
              <p className={styles.text}>
                <strong>Hola</strong> {userData.nickname}
              </p>
              <p className={styles.text}>
              Somos ERNI. Desde 1994 nos centramos en asesorar a empresas en Innovación y Tecnología, con el objetivo de impulsar su rendimiento mediante el desarrollo de software y la digitalización de sus procesos de negocio críticos, sentando las bases de un futuro digital.

La clave del éxito es la mentalidad de nuestros ERNIans, moldeada por los valores y virtudes que nos definen. Trabajamos codo a codo con nuestros clientes para ayudarles a ser más eficientes e innovadores que sus competidores, creando alianzas basadas en valores genuinos para alcanzar objetivos ambiciosos.
              </p>
            </div>
          )}
          <div style={{ marginTop: '20px' }}>
            ¡Síguenos!
            <div className={styles.followLinks}>
              <a
                href="https://www.linkedin.com/company/erni/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  const links = getSocialLinks();
                  openAppOrWeb(links.linkedin.app, links.linkedin.web);
                }}
              >
                [LinkedIn]
              </a>
              <a
                href="https://www.instagram.com/ernigroup/"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  const links = getSocialLinks();
                  openAppOrWeb(links.instagram.app, links.instagram.web);
                }}
              >
                [Instagram]
              </a>
              <a
                href="https://www.youtube.com/@erniacademy"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  const links = getSocialLinks();
                  openAppOrWeb(links.youtube.app, links.youtube.web);
                }}
              >
                [Youtube]
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function About() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Cargando...
            </p>
          </div>
        </main>
      </div>
    }>
      <AboutContent />
    </Suspense>
  );
}
