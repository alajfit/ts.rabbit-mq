# ts.rabbit-mq
Demo of TypeScript and Rabbit MQ

## Architecture

![arch](./docs/arch.png)

## Resources

- [Express JS](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [TYPE ORM](https://typeorm.io/#/)
- [Rabbit MQ](https://www.rabbitmq.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Interesting Articles While Building

- [REST PUT Debate](https://stackoverflow.com/questions/630453/put-vs-post-in-rest)

## Useful Docker Commands

```sh
# Stop all running Docker Containers
docker container stop $(docker container list -q)

# Delete all images
docker rmi -f $(docker images -a -q)

# Delte all existing containers
docker rm $(docker ps -a -q)

# Bring up Docker Compose and Rebuild
docker-compose up --force-recreate
```

## Future Aims
- Idempotent
- Replayable
- Rollback
- Single write per Queue consumer
- DAG of Data Flow