# Funnder Production Checklist

## Pre-Deployment

### Environment Setup
- [ ] All required environment variables configured
- [ ] Database credentials secured and rotated
- [ ] API keys with minimal required permissions
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled

### Security
- [ ] No secrets in code or logs
- [ ] Webhook signature verification enabled
- [ ] PII redaction in logs confirmed
- [ ] SSL/TLS certificates configured
- [ ] Security headers implemented

### Database
- [ ] Production database provisioned
- [ ] Connection pooling configured
- [ ] Backup strategy implemented
- [ ] Migration scripts tested
- [ ] Data retention policy applied

## Deployment

### Platform Setup
- [ ] Hosting platform configured (Vercel/Railway/Docker)
- [ ] Domain and DNS configured
- [ ] SSL certificates active
- [ ] CDN configured (if applicable)
- [ ] Monitoring and logging setup

### Application
- [ ] Build process successful
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Health checks responding
- [ ] Error tracking configured

## Post-Deployment

### Verification
- [ ] Health endpoint responding: `/api/health`
- [ ] All API endpoints functional
- [ ] Frontend connecting to backend
- [ ] Voice provider webhooks working
- [ ] Database queries performing well

### Monitoring
- [ ] Application performance monitoring active
- [ ] Error rates within acceptable limits
- [ ] Response times meeting SLA
- [ ] Database performance metrics
- [ ] External API quota monitoring

### Documentation
- [ ] Deployment runbook updated
- [ ] Environment variables documented
- [ ] Rollback procedures tested
- [ ] Team access configured
- [ ] Support contacts established

## Maintenance

### Regular Tasks
- [ ] Dependency updates scheduled
- [ ] Security patches applied
- [ ] Performance reviews conducted
- [ ] Backup restoration tested
- [ ] Disaster recovery plan validated

### Scaling Preparation
- [ ] Horizontal scaling plan ready
- [ ] Database scaling strategy
- [ ] CDN optimization
- [ ] Caching strategy implemented
- [ ] Load balancing configured

---

## Emergency Contacts
- **DevOps Lead**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Security Team**: [Contact Info]
- **Voice Provider Support**: [Contact Info]

## Rollback Procedure
1. Identify last known good deployment
2. Revert database migrations if needed
3. Deploy previous version
4. Verify all systems operational
5. Notify stakeholders

**Deployment Date**: ___________
**Deployed By**: ___________
**Version**: ___________
