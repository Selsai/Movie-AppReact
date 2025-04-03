import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment, deleteComment } from './redux/commentSlice';
import { Card, Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import './App.css';

const schema = yup.object().shape({
  comment: yup
    .string()
    .required('Le commentaire est obligatoire')
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères'),
  note: yup
    .number()
    .typeError('Veuillez sélectionner une note valide')
    .required('La note est obligatoire')
    .min(1, 'La note doit être au moins 1')
    .max(5, 'La note ne peut pas dépasser 5'),
  acceptConditions: yup
    .boolean()
    .oneOf([true], 'Vous devez accepter les conditions générales')
    .required('Vous devez accepter les conditions générales')
});

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const comments = useSelector(state => state.comments.list);
  const dispatch = useDispatch();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitted }, 
    reset 
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur'
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch('https://jsonfakery.com/movies/random/1');
        if (!response.ok) throw new Error();
        const data = await response.json();
        setMovie(data[0]);
      } catch (error) {
        console.error("Erreur lors du chargement du film:", error);
        setError("Une erreur est survenue. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, []);

  const onSubmit = (data) => {
    const newComment = {
      id: Date.now(),
      text: data.comment,
      rating: data.note
    };
    dispatch(addComment(newComment));
    reset();
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </Container>
  );

  if (error) return (
    <Container className="py-4">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="mb-4 border">
            <Card.Img 
              variant="top"
              src={movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : movie.poster}
              alt={movie.title || movie.original_title}
              className="card-img"
            />
            <Card.Body>
              <Card.Title as="h2">{movie.title || movie.original_title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Sortie le {movie.release_date}</Card.Subtitle>
              <Card.Text>{movie.overview || movie.plot}</Card.Text>
              <Card.Text className="fw-bold">
                Note moyenne : {movie.vote_average || movie.rating} ({movie.vote_count || movie.votes} votes)
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="border-0">
            <Card.Body className="p-0">
              <h3>Commentaires</h3>
              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Ajouter un commentaire :</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    {...register('comment')} 
                    className={errors.comment ? 'is-invalid' : ''}
                    isInvalid={!!errors.comment}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.comment?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Note :</Form.Label>
                  <Form.Select 
                    {...register('note')} 
                    className={`${errors.note ? 'border-danger' : 'border-secondary'}`}
                    isInvalid={!!errors.note}
                  >
                    <option value="">Sélectionnez une note</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.note?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="J'accepte les conditions générales"
                    {...register('acceptConditions')}
                    isInvalid={!!errors.acceptConditions}
                    feedback={errors.acceptConditions?.message}
                    feedbackType="invalid"
                  />
                </Form.Group>

                <Button variant="primary" type="submit">Ajouter</Button>
              </Form>

              {comments.length === 0 ? (
                <Alert variant="info" className="mt-4 text-center">
                  Aucun commentaire pour le moment
                </Alert>
              ) : (
                <div className="comment-section">
                  {comments.map(comment => (
                    <Card key={comment.id} className="mt-3 comment-card">
                      <Card.Body>
                        <div className="fw-bold">Note : {comment.rating}/5</div>
                        <Card.Text>{comment.text}</Card.Text>
                        <div className="comment-footer">
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => dispatch(deleteComment(comment.id))}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
