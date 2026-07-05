"""Departments app - all in one file for simplicity."""

from django.db import models
from django.urls import path, include
from rest_framework import serializers, viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.routers import DefaultRouter
from apps.core.mixins import HospitalScopedMixin


class Department(models.Model):
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    head_doctor = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ['hospital', 'name']

    def __str__(self):
        return f"{self.name} - {self.hospital.name}"
